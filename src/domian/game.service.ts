import "reflect-metadata"
import {injectable} from "inversify";
import {ObjectId} from "mongodb";
import {Query} from "../repositories/types/query.type";
import {UsersService} from "./users.service";
import {GameRepository} from "../repositories/game-repository-db";
import {
    GamePairViewModelPagination,
    GamePairViewModel, GameStatuses, GamePlayerProgressViewModel,
} from "./types/game.type";
import {GameServiceClass} from "./classes/game.service.class";
import {IGame, IPlayer} from "../repositories/interfaces/game.interface";
import {GameParam, PaginationTopUsers} from "./types/user.type";
import {AnswerInputModel, AnswerStatus, AnswerViewModel, QuestionViewModel} from "./types/question.type";
import {QuestionService} from "./question.service.";

@injectable()
export class GameService {
    constructor(
        private questionService: QuestionService,
        private userService: UsersService,
        private gameRepository: GameRepository
    ) {
    }

    buildResponseGame(game: IGame): GamePairViewModel {
        return {
            id: game._id.toString(),
            firstPlayer: game.firstPlayer,
            secondPlayer: game.secondPlayer,
            questions: game.questions,
            status: game.status,
            pairCreatedDate: game.pairCreatedDate.toDateString(),
            startGameDate: game.startGameDate ? game.startGameDate.toDateString() : null,
            finishGameDate: game.finishGameDate ? game.finishGameDate.toDateString() : null,
        }
    }

    //Восстановить текущую игру (найти себя в инре и статус игры ACTIVE)
    //Пингование игры, возвращает об игре актуальный статус и статус второго игрока
    async getCurrentGame(userId: ObjectId): Promise<GamePairViewModel | null> {
        const user = await this.userService.getUser(userId)
        if (!user) return null
        const padding = await this.gameRepository.findPaddingCurrentGame(userId.toString())
        if (padding) return this.buildResponseGame(padding)
        const active = await this.gameRepository.findActiveGame(userId.toString())
        if (!active) return null
        return this.buildResponseGame(active)
    }

    //Пинговать игру (Проверка после создания, подключился ли 2 игрок и получаю вопросы)
    //если пользователь не учавствует, то вернуть 403
    async getGameById(userId: ObjectId, gameId: ObjectId): Promise<GamePairViewModel | null> {
        const result = await this.gameRepository.getGameById(gameId, userId.toString())
        if (!result) return null
        return this.buildResponseGame(result)
    }

    async getAllGameUsers(){
        return await this.gameRepository.getAllGame()
    }

    //Получить мою статистику (Все пары где я учавствовал (статус игры Финал))
    async getStaticGames(userId: ObjectId, queryParams: Query): Promise<GamePairViewModelPagination | null> {
        const user = await this.userService.getUser(userId)
        if (!user) return null
        const items = await this.gameRepository.getAllGamesUserById(userId.toString(), queryParams)
        const totalCount = items.length
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const pagesCount = Math.ceil(totalCount / pageSize)
        return {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map((item: IGame) => this.buildResponseGame(item))
        }
    }

    //Создать игру или подключиться к существующей
    //Проверить нет ли уже в активной паре
    async connectionGame(userId: ObjectId): Promise<GamePairViewModel | null> {
        const user = await this.userService.getUser(userId)
        if (!user) return null
        //Поиск текущей сессии
        const gameActive = await this.getCurrentGame(userId)
        if (gameActive) return gameActive
        //Если есть активная сессия
        const gamePadding = await this.gameRepository.findPaddingGame()
        if (gamePadding) {
            gamePadding.secondPlayer.user = user
            gamePadding.questions = await this.getQuestionsForNewGame()
            gamePadding.status = GameStatuses.ACTIVE
            gamePadding.startGameDate = new Date()
            const result = await this.gameRepository.updateGame(gamePadding._id, gamePadding)
            if (!result) return null
            return this.buildResponseGame(result)
        }
        //Если нет активных сессий
        const createNewGame = new GameServiceClass(user)
        const result = await this.gameRepository.createGame(createNewGame)
        if (!result) return null
        return this.buildResponseGame(result)
    }

    async getQuestionsForNewGame(): Promise<QuestionViewModel[]> {
        return await this.questionService.getFiveRandomQuestions(5)
    }

    //В текущей паре получить следующий вопрос
    //Проверка, что вопрос идет по порядку
    //Вернуть правильный или не правильный ответ
    //Вернуть вопросы второго игрока
    async sendAnswers(userId: ObjectId, answer: AnswerInputModel): Promise<AnswerViewModel | null> {
        let score = 0
        const user = await this.userService.getUser(userId)
        if(!user) return null
        const game = await this.gameRepository.findActiveGame(userId.toString())
        if(!game) return null

        if(game.status === GameStatuses.FINISH) return null

        const currentPlayer = (game.firstPlayer.user.id === userId.toString()) ? game.firstPlayer : game.secondPlayer
        const anotherPlayer = (game.firstPlayer.user.id === userId.toString()) ? game.secondPlayer : game.firstPlayer

        const questionCount = game.questions.length

        if((currentPlayer.endTime + 5 * 1000 >= Date.now()) && (anotherPlayer.answers.length === 4)){ console.log(currentPlayer.user.login + "ПОсмотри")}

        if(
            (currentPlayer.answers.length === questionCount) && (anotherPlayer.answers.length === questionCount) ||
            (currentPlayer.endTime !== 0 && currentPlayer.endTime + 10 * 1000 < Date.now())
        ){
            await this.finishGame(game, currentPlayer, anotherPlayer)
            return null
        }

        if(currentPlayer.answers.length === questionCount) return null

        const question = game.questions[currentPlayer.answers.length]
        const checkQuestion = await this.questionService.getQuestionByAnswer(new ObjectId(question.id), answer.answer)
        currentPlayer.answers.push(checkQuestion!)

        if(checkQuestion!.answerStatus === AnswerStatus.CORRECT){
            score++
        }
        if(currentPlayer.answers.length === questionCount && anotherPlayer.answers.length < questionCount) {
            score++
            anotherPlayer.endTime = Date.now()
        }
        currentPlayer.score += score
        await this.gameRepository.updateGame(game._id, game)
        return checkQuestion
    }

    //Получить топ игроков
    async getTopUsers(queryParams: Query): Promise<PaginationTopUsers> {
        return await this.userService.getGameUsers(queryParams)
    }


    async finishGame(game: IGame, currentPlayer: IPlayer, anotherPlayer: IPlayer){
        game.status = GameStatuses.FINISH
        game.finishGameDate = new Date()
        await this.gameRepository.updateGame(game._id, game)
        if ((currentPlayer.score > anotherPlayer.score) ||
            ((currentPlayer.score === anotherPlayer.score) && (currentPlayer.endTime === 0))
        ) {
            await this.saveGameStatisticUser(game._id.toString(), currentPlayer, 1, 0)
            await this.saveGameStatisticUser(game._id.toString(), anotherPlayer, 0, 1)
        } else {
            await this.saveGameStatisticUser(game._id.toString(), anotherPlayer, 1, 0)
            await this.saveGameStatisticUser(game._id.toString(), currentPlayer, 0, 1)
        }

    }

    async saveGameStatisticUser(
        gameId: string,
        player:IPlayer,
        winsCount: number,
        lossesCount: number){
        const statistic: GameParam = {
            gameId: gameId,
            sumScore: player.score,
            winsCount,
            lossesCount
        }
        await this.userService.addFinishGame(new ObjectId(player.user.id), statistic)
    }

}