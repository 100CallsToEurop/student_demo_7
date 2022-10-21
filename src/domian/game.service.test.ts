import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {QuestionRepository} from "../repositories/question-repository";
import {QuestionService} from "./question.service.";
import {GameRepository} from "../repositories/game-repository-db";
import {GameService} from "./game.service";
import {UsersRepository} from "../repositories/users.repository";
import {UsersService} from "./users.service";
import {QuestionDto} from "./dto/QuestionDto";
import {CreateUserDto} from "./dto/create-user.dto";
import {ObjectId} from "mongodb";
import {GamePairViewModel, GameStatuses} from "./types/game.type";
import {AnswerStatus, AnswerViewModel} from "./types/question.type";
import {UserViewModel} from "./types/user.type";
import {QuestionModel} from "../repositories/modeles/question.model";
import {UserModel} from "../repositories/modeles/user.model";
import {UserServiceClass} from "./classes/user.service.class";
import bcrypt from "bcrypt";

jest.setTimeout(15000)
describe("integration test for gameServer", () => {
    let mongoServer: MongoMemoryServer

    //Вызов перед каждым тестом
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })

    //Вызов после всех тестов
    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    //Вызов перед каждым describe (если в каждом describe прописать будет перед каждым it)
   /* beforeEach(async () =>{
        await mongoose.connection.db.dropDatabase()
    })*/

    const userRepository = new UsersRepository()
    const userService = new UsersService(userRepository)

    const questionsRepository = new QuestionRepository()
    const questionsService = new QuestionService(questionsRepository)

    const gameRepository = new GameRepository()
    const gameService = new GameService(questionsService, userService, gameRepository)

    const questions = [
        {
            question: "Почему змеи высовывают язык?",
            answer: "Чтобы понюхать воздух"
        },
        {
            question: "Какое животное самое крупное на Земле?",
            answer: "Синий кит"
        },
        {
            question: "Какая кошка самая большая на планете?",
            answer: "Тигр"
        },
        {
            question: "Какое млекопитающее умеет летать?",
            answer: "Летучая мышь"
        },
        {
            question: "Чем утконос отличается от других млекопитающих?",
            answer: "Откладывает яйца"
        }
    ]


    const users: CreateUserDto[] = [
        {
            login: "test1",
            email: "test1@mail.ru",
            password: "12345",
        },
        {
            login: "test2",
            email: "test2@mail.ru",
            password: "12345"
        }
    ]

    const user1 = new UserServiceClass(users[0], "$2b$10$YAY7ZbQanNS2g8.kUVXRmObPvmQ0Pe8/51o5DKnr64/qQyaDTO/i2", true)
    const user2 = new UserServiceClass(users[1], "$2b$10$YAY7ZbQanNS2g8.kUVXRmObPvmQ0Pe8/51o5DKnr64/qQyaDTO/i2", true)
    const firstUserId = user1._id
    const firstUserLogin = user1.accountData.userName
    const secondUserId = user2._id
    const secondLogin = user2.accountData.userName

    describe("connectionGame first user creates a new game", () => {

        //Удаляем базу, после выполнения всех тестов
        beforeAll( async () =>{
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
        })

        it("connectionGame should create a new game for first user and wait for the second", async () => {
            const result = await gameService.connectionGame(firstUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe("pending")
            expect(result!.secondPlayer.user.login).toBe("pending")
            expect(result!.questions.length).toBe(0)
            expect(result!.status).toBe(GameStatuses.PENDING)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
        it("connectionGame should return the connection of the second user", async () => {
            const result = await gameService.connectionGame(secondUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe(secondUserId.toString())
            expect(result!.secondPlayer.user.login).toBe(secondLogin)
            expect(result!.questions.length).toBe(5)
            expect(result!.status).toBe(GameStatuses.ACTIVE)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).not.toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
        it("should return the active game if there is already a second user", async () => {
            const result = await gameService.connectionGame(firstUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe(secondUserId.toString())
            expect(result!.secondPlayer.user.login).toBe(secondLogin)
            expect(result!.questions.length).toBe(5)
            expect(result!.status).toBe(GameStatuses.ACTIVE)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).not.toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
        it("should return the active game if there is already a first user", async () => {
            const result = await gameService.connectionGame(secondUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe(secondUserId.toString())
            expect(result!.secondPlayer.user.login).toBe(secondLogin)
            expect(result!.questions.length).toBe(5)
            expect(result!.status).toBe(GameStatuses.ACTIVE)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).not.toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
        it("getAllGameUsers should return 1 pair", async ()=>{
            const items = await gameService.getAllGameUsers()
            expect(items.length).toBe(1)
        })
    })
    describe("connectionGame first user pings the game", ()=>{
        beforeAll( async () =>{
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
        })
        it("connectionGame should create a new game for first user and wait for the second", async () => {
            const result = await gameService.connectionGame(firstUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe("pending")
            expect(result!.secondPlayer.user.login).toBe("pending")
            expect(result!.questions.length).toBe(0)
            expect(result!.status).toBe(GameStatuses.PENDING)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
        for(let i = 1; i < 4; i++){
            it(`getCurrentGame should return the game of the first user pending ${i}`, async () => {
                const result = await gameService.getCurrentGame(firstUserId)
                expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
                expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
                expect(result!.secondPlayer.user.id).toBe("pending")
                expect(result!.secondPlayer.user.login).toBe("pending")
                expect(result!.questions.length).toBe(0)
                expect(result!.status).toBe(GameStatuses.PENDING)
                expect(result!.pairCreatedDate).not.toBeNull()
                expect(result!.startGameDate).toBeNull()
                expect(result!.finishGameDate).toBeNull()
            })
        }
        it("connectionGame should return the connection of the second user", async () => {
            const result = await gameService.connectionGame(secondUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe(secondUserId.toString())
            expect(result!.secondPlayer.user.login).toBe(secondLogin)
            expect(result!.questions.length).toBe(5)
            expect(result!.status).toBe(GameStatuses.ACTIVE)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).not.toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
        it("should return the active game if there is already a second user", async () => {
            const result = await gameService.connectionGame(firstUserId)
            expect(result!.firstPlayer.user.id).toBe(firstUserId.toString())
            expect(result!.firstPlayer.user.login).toBe(firstUserLogin)
            expect(result!.secondPlayer.user.id).toBe(secondUserId.toString())
            expect(result!.secondPlayer.user.login).toBe(secondLogin)
            expect(result!.questions.length).toBe(5)
            expect(result!.status).toBe(GameStatuses.ACTIVE)
            expect(result!.pairCreatedDate).not.toBeNull()
            expect(result!.startGameDate).not.toBeNull()
            expect(result!.finishGameDate).toBeNull()
        })
    })
    describe("sendAnswers Users play the game (First user wins)", ()=>{
        let firstUserConnect: any
        let questions_game: any
        let correctAnswer: any
        beforeAll( async () =>{
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
            firstUserConnect = await gameService.connectionGame(firstUserId)
            questions_game = (await gameService.connectionGame(secondUserId))!.questions

      })
        it(`the first player send a response correct answer ${1}`, async () => {
            const correctAnswer1 = (await questionsService.getQuestionById(new ObjectId(questions_game[0].id)))!.answer
            const correctAnswer2 = (await questionsService.getQuestionById(new ObjectId(questions_game[1].id)))!.answer
            const correctAnswer3 = (await questionsService.getQuestionById(new ObjectId(questions_game[2].id)))!.answer
            const correctAnswer4 = (await questionsService.getQuestionById(new ObjectId(questions_game[3].id)))!.answer
            const correctAnswer5 = (await questionsService.getQuestionById(new ObjectId(questions_game[4].id)))!.answer

            await answerTest(1, questions_game[0].id, firstUserId, correctAnswer1, 1)
            await answerTest(1, questions_game[0].id, secondUserId, correctAnswer1, 1)

            await answerTest(2, questions_game[1].id, firstUserId, correctAnswer2, 2)
            await answerTest(2, questions_game[1].id, secondUserId, correctAnswer2, 2)

            await answerTest(3, questions_game[2].id, firstUserId, correctAnswer3, 3)
            await answerTest(3, questions_game[2].id, secondUserId, correctAnswer3, 3)

            await answerTest(4, questions_game[3].id, firstUserId, correctAnswer4, 4)
            await answerTest(4, questions_game[3].id, secondUserId, correctAnswer4, 4)

            await answerTest(5, questions_game[4].id, firstUserId, correctAnswer5, 6)
            await answerTest(5, questions_game[4].id, secondUserId, correctAnswer5, 5)
            })
        it("Game finish. Checking the first user", async()=>{
            await finishGameTest(firstUserId, new ObjectId(firstUserConnect.id), correctAnswer, 6)
            await finishGameTest(secondUserId, new ObjectId(firstUserConnect.id), correctAnswer,5)
        })
        it("getStaticGames should get game player", async ()=> {
            await getStaticGamesTest(firstUserId, new ObjectId(firstUserConnect.id),6, 5)
            await getStaticGamesTest(secondUserId, new ObjectId(firstUserConnect.id),6, 5)
        })
        it("getTopUsers should response top users", async ()=> {
            const result = await gameService.getTopUsers({PageNumber: "1", PageSize: "10"})
            expect(result?.totalCount).toBe(2)
            expect(result?.page).toBe(1)
            expect(result?.pagesCount).toBe(1)
            expect(result?.pageSize).toBe(10)
            expect(result?.items.length).toBe(2)
            expect(result?.items).toEqual([{
                user: {
                    id: user1._id.toString(),
                    login: user1.accountData.userName
                },
                sumScore: 6,
                avgScores: 6,
                gamesCount: 1,
                winsCount: 1,
                lossesCount: 0
            },
                {
                    user: {
                        id: user2._id.toString(),
                        login: user2.accountData.userName
                    },
                    sumScore: 5,
                    avgScores: 5,
                    gamesCount: 1,
                    winsCount: 0,
                    lossesCount: 1
                }])
        })
    })
    describe("sendAnswers Users play the game (Firs user user makes mistakes. Second user wins)", ()=> {
        let firstUserConnect: any
        let questions_game: any
        let correctAnswer: any
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
            firstUserConnect = await gameService.connectionGame(firstUserId)
            questions_game = (await gameService.connectionGame(secondUserId))!.questions
        })

            it(`the first player send a response incorrect answer ${1}`, async () => {

                const correctAnswer1 = (await questionsService.getQuestionById(new ObjectId(questions_game[0].id)))!.answer
                const correctAnswer2 = (await questionsService.getQuestionById(new ObjectId(questions_game[1].id)))!.answer
                const correctAnswer3 = (await questionsService.getQuestionById(new ObjectId(questions_game[2].id)))!.answer
                const correctAnswer4 = (await questionsService.getQuestionById(new ObjectId(questions_game[3].id)))!.answer
                const correctAnswer5 = (await questionsService.getQuestionById(new ObjectId(questions_game[4].id)))!.answer
                const incorrectAnswer = "blabla"

                await answerTest(1, questions_game[0].id, firstUserId, incorrectAnswer, 0)
                await answerTest(1, questions_game[0].id, secondUserId, correctAnswer1, 1)

                await answerTest(2, questions_game[1].id, firstUserId, incorrectAnswer, 0)
                await answerTest(2, questions_game[1].id, secondUserId, correctAnswer2, 2)

                await answerTest(3, questions_game[2].id, firstUserId, correctAnswer3, 1)
                await answerTest(3, questions_game[2].id, secondUserId, correctAnswer3, 3)

                await answerTest(4, questions_game[3].id, firstUserId, correctAnswer4, 2)
                await answerTest(4, questions_game[3].id, secondUserId, correctAnswer4, 4)

                await answerTest(5, questions_game[4].id, firstUserId, correctAnswer5, 4)
                await answerTest(5, questions_game[4].id, secondUserId, correctAnswer5, 5)
            })
        it("Game finish. Checking the first user", async()=>{
            await finishGameTest(firstUserId, new ObjectId(firstUserConnect.id), correctAnswer, 4)
            await finishGameTest(secondUserId, new ObjectId(firstUserConnect.id), correctAnswer,5)
        })
        it("getStaticGames should get game player", async ()=> {
            await getStaticGamesTest(firstUserId, new ObjectId(firstUserConnect.id),4, 5)
            await getStaticGamesTest(secondUserId, new ObjectId(firstUserConnect.id),4, 5)
        })
        it("getTopUsers should response top users", async ()=> {
            const result = await gameService.getTopUsers({PageNumber: "1", PageSize: "10"})
            expect(result?.totalCount).toBe(2)
            expect(result?.page).toBe(1)
            expect(result?.pagesCount).toBe(1)
            expect(result?.pageSize).toBe(10)
            expect(result?.items.length).toBe(2)
            expect(result?.items).toEqual([{
                user: {
                    id: user1._id.toString(),
                    login: user1.accountData.userName
                },
                sumScore: 4,
                avgScores: 4,
                gamesCount: 1,
                winsCount: 0,
                lossesCount: 1
            },
                {
                    user: {
                        id: user2._id.toString(),
                        login: user2.accountData.userName
                    },
                    sumScore: 5,
                    avgScores: 5,
                    gamesCount: 1,
                    winsCount: 1,
                    lossesCount: 0
                }])
        })

    })
    describe("sendAnswers Users play the game (Firs user user makes mistakes and second user finishes first. Second user wins)", ()=> {
        let firstUserConnect: any
        let questions_game: any
        let correctAnswer: any
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
            firstUserConnect = await gameService.connectionGame(firstUserId)
            questions_game = (await gameService.connectionGame(secondUserId))!.questions
        })
        it(`the first player send a response incorrect answer ${1}`, async () => {

            const correctAnswer1 = (await questionsService.getQuestionById(new ObjectId(questions_game[0].id)))!.answer
            const correctAnswer2 = (await questionsService.getQuestionById(new ObjectId(questions_game[1].id)))!.answer
            const correctAnswer3 = (await questionsService.getQuestionById(new ObjectId(questions_game[2].id)))!.answer
            const correctAnswer4 = (await questionsService.getQuestionById(new ObjectId(questions_game[3].id)))!.answer
            const correctAnswer5 = (await questionsService.getQuestionById(new ObjectId(questions_game[4].id)))!.answer
            const incorrectAnswer = "blabla"

            await answerTest(1, questions_game[0].id, firstUserId, incorrectAnswer, 0)
            await answerTest(1, questions_game[0].id, secondUserId, correctAnswer1, 1)

            await answerTest(2, questions_game[1].id, firstUserId, incorrectAnswer, 0)
            await answerTest(2, questions_game[1].id, secondUserId, correctAnswer2, 2)

            await answerTest(3, questions_game[2].id, firstUserId, correctAnswer3, 1)
            await answerTest(3, questions_game[2].id, secondUserId, correctAnswer3, 3)

            await answerTest(4, questions_game[3].id, firstUserId, correctAnswer4, 2)
            await answerTest(4, questions_game[3].id, secondUserId, correctAnswer4, 4)

            await answerTest(5, questions_game[4].id, secondUserId, correctAnswer5, 6)
            await answerTest(5, questions_game[4].id, firstUserId, correctAnswer5, 3)

        })
        it("Game finish. Checking the first user", async()=>{
            await finishGameTest(firstUserId, new ObjectId(firstUserConnect.id), correctAnswer, 3)
            await finishGameTest(secondUserId, new ObjectId(firstUserConnect.id), correctAnswer,6)

        })
        it("getStaticGames should get game player", async ()=> {
            await getStaticGamesTest(firstUserId, new ObjectId(firstUserConnect.id),3, 6)
            await getStaticGamesTest(secondUserId, new ObjectId(firstUserConnect.id),3, 6)
        })
        it("getTopUsers should response top users", async ()=> {
            const result = await gameService.getTopUsers({PageNumber: "1", PageSize: "10"})
            expect(result?.totalCount).toBe(2)
            expect(result?.page).toBe(1)
            expect(result?.pagesCount).toBe(1)
            expect(result?.pageSize).toBe(10)
            expect(result?.items.length).toBe(2)
            expect(result?.items).toEqual([{
                user: {
                    id: user1._id.toString(),
                    login: user1.accountData.userName
                },
                sumScore: 3,
                avgScores: 3,
                gamesCount: 1,
                winsCount: 0,
                lossesCount: 1
            },
                {
                    user: {
                        id: user2._id.toString(),
                        login: user2.accountData.userName
                    },
                    sumScore: 6,
                    avgScores: 6,
                    gamesCount: 1,
                    winsCount: 1,
                    lossesCount: 0
                }])
        })

    })
    describe("sendAnswers Users play the game (Firs user user makes mistakes and second user makes mistakes. The second user will finish faster, but there will be a draw. Second user wins)", ()=> {
        let firstUserConnect: any
        let questions_game: any
        let correctAnswer: any
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
            firstUserConnect = await gameService.connectionGame(firstUserId)
            questions_game = (await gameService.connectionGame(secondUserId))!.questions
        })
        it(`the first player send a response incorrect answer ${1}`, async () => {
            const correctAnswer1 = (await questionsService.getQuestionById(new ObjectId(questions_game[0].id)))!.answer
            const correctAnswer2 = (await questionsService.getQuestionById(new ObjectId(questions_game[1].id)))!.answer
            const correctAnswer3 = (await questionsService.getQuestionById(new ObjectId(questions_game[2].id)))!.answer
            const correctAnswer4 = (await questionsService.getQuestionById(new ObjectId(questions_game[3].id)))!.answer
            const correctAnswer5 = (await questionsService.getQuestionById(new ObjectId(questions_game[4].id)))!.answer
            const incorrectAnswer = "blabla"

            await answerTest(1,  questions_game[0].id, firstUserId, incorrectAnswer, 0)
            await answerTest(1,  questions_game[0].id, secondUserId, incorrectAnswer, 0)

            await answerTest(2, questions_game[1].id, firstUserId, correctAnswer2, 1)
            await answerTest(2, questions_game[1].id, secondUserId, incorrectAnswer, 0)

            await answerTest(3, questions_game[2].id, firstUserId, correctAnswer3, 2)
            await answerTest(3, questions_game[2].id, secondUserId, correctAnswer3, 1)

            await answerTest(4, questions_game[3].id, firstUserId, correctAnswer4, 3)
            await answerTest(4, questions_game[3].id, secondUserId, correctAnswer4, 2)

            await answerTest(5, questions_game[4].id, secondUserId, correctAnswer5, 4)
            await answerTest(5, questions_game[4].id,  firstUserId, correctAnswer5, 4)

        })
        it("Game finish. Checking the first user", async () => {
            await finishGameTest(firstUserId, new ObjectId(firstUserConnect.id), correctAnswer, 4)
            await finishGameTest(secondUserId, new ObjectId(firstUserConnect.id), correctAnswer,4)
        })
        it("getStaticGames should get game player", async ()=> {
            await getStaticGamesTest(firstUserId, new ObjectId(firstUserConnect.id),4, 4)
            await getStaticGamesTest(secondUserId, new ObjectId(firstUserConnect.id),4, 4)
        })
        it("getTopUsers should response top users", async ()=> {
            const result = await gameService.getTopUsers({PageNumber: "1", PageSize: "10"})
            expect(result?.totalCount).toBe(2)
            expect(result?.page).toBe(1)
            expect(result?.pagesCount).toBe(1)
            expect(result?.pageSize).toBe(10)
            expect(result?.items.length).toBe(2)
            expect(result?.items).toEqual([{
                user: {
                    id: user1._id.toString(),
                    login: user1.accountData.userName
                },
                sumScore: 4,
                avgScores: 4,
                gamesCount: 1,
                winsCount: 0,
                lossesCount: 1
            },
                {
                    user: {
                        id: user2._id.toString(),
                        login: user2.accountData.userName
                    },
                    sumScore: 4,
                    avgScores: 4,
                    gamesCount: 1,
                    winsCount: 1,
                    lossesCount: 0
                }])
        })



    })
    describe("sendAnswers Users play the game (Firs user user makes mistakes and second Doesn't answer questions for a long time. First user wins)", ()=> {
        let firstUserConnect: any
        let questions_game: any
        let correctAnswer: any
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
            await QuestionModel.insertMany(questions)
            await UserModel.insertMany([user1, user2])
            firstUserConnect = await gameService.connectionGame(firstUserId)
            questions_game = (await gameService.connectionGame(secondUserId))!.questions
        })
        it(`the first player send a response incorrect answer ${1}`, async () => {
            const correctAnswer1 = (await questionsService.getQuestionById(new ObjectId(questions_game[0].id)))!.answer
            const correctAnswer2 = (await questionsService.getQuestionById(new ObjectId(questions_game[1].id)))!.answer
            const correctAnswer3 = (await questionsService.getQuestionById(new ObjectId(questions_game[2].id)))!.answer
            const correctAnswer4 = (await questionsService.getQuestionById(new ObjectId(questions_game[3].id)))!.answer
            const correctAnswer5 = (await questionsService.getQuestionById(new ObjectId(questions_game[4].id)))!.answer
            const incorrectAnswer = "blabla"

            await answerTest(1,  questions_game[0].id, firstUserId, correctAnswer1, 1)
            await answerTest(1,  questions_game[0].id, secondUserId, correctAnswer1, 1)

            await answerTest(2, questions_game[1].id, firstUserId, correctAnswer2, 2)
            await answerTest(2, questions_game[1].id, secondUserId, correctAnswer2, 2)

            await answerTest(3, questions_game[2].id, firstUserId, correctAnswer3, 3)
            await answerTest(3, questions_game[2].id, secondUserId, correctAnswer3, 3)

            await answerTest(4, questions_game[3].id, firstUserId, correctAnswer4, 4)
            await answerTest(5, questions_game[4].id, firstUserId, correctAnswer5, 6)

            //

        })

        it("The second user answered late", async ()=>{

            await new Promise(resolve => setTimeout(resolve, 13000));
            const correctAnswer4 = (await questionsService.getQuestionById(new ObjectId(questions_game[3].id)))!.answer
            const answer = await answerTest(4, questions_game[3].id, secondUserId, correctAnswer4, 3)
            console.log(answer)
            expect(answer).toBeNull()
        })

        it("Game finish. Checking the first user", async () => {
            await finishGameTest(firstUserId, new ObjectId(firstUserConnect.id), correctAnswer, 6)
            await finishGameTest(secondUserId, new ObjectId(firstUserConnect.id), correctAnswer,3)
        })
        it("getStaticGames should get game player", async ()=> {
            await getStaticGamesTest(firstUserId, new ObjectId(firstUserConnect.id),6, 3)
            await getStaticGamesTest(secondUserId, new ObjectId(firstUserConnect.id),6, 3)
        })
        it("getTopUsers should response top users", async ()=> {
            const result = await gameService.getTopUsers({PageNumber: "1", PageSize: "10"})
            expect(result?.totalCount).toBe(2)
            expect(result?.page).toBe(1)
            expect(result?.pagesCount).toBe(1)
            expect(result?.pageSize).toBe(10)
            expect(result?.items.length).toBe(2)
            expect(result?.items).toEqual([{
                user: {
                    id: user1._id.toString(),
                    login: user1.accountData.userName
                },
                sumScore: 6,
                avgScores: 6,
                gamesCount: 1,
                winsCount: 1,
                lossesCount: 0
            },
                {
                    user: {
                        id: user2._id.toString(),
                        login: user2.accountData.userName
                    },
                    sumScore: 3,
                    avgScores: 3,
                    gamesCount: 1,
                    winsCount: 0,
                    lossesCount: 1
                }])
        })



    })

    async function answerTest(gameNumber: number, questionId: number, userId: ObjectId, answerUser: string, scoreUser: number){
        const correctAnswer = (await questionsService.getQuestionById(new ObjectId(questionId)))!.answer
        const answer = await gameService.sendAnswers(userId, {answer: answerUser})
        if(!answer) return null
        const game = await gameService.getCurrentGame(userId)
        const currentPlayer = (game!.firstPlayer.user.id === userId.toString()) ? game!.firstPlayer : game!.secondPlayer

        expect(answer!.questionId).toBe(questionId)
        if(answerUser === correctAnswer) expect(answer!.answerStatus).toBe(AnswerStatus.CORRECT)
        if(answerUser !== correctAnswer) expect(answer!.answerStatus).toBe(AnswerStatus.INCORRECT)
        expect(answer!.addedAt).toEqual(new Date().toDateString())
        expect(currentPlayer.answers.length).toBe(gameNumber)
        expect(currentPlayer.score).toBe(scoreUser)
    }
    async function finishGameTest(userId: ObjectId, gameId: ObjectId, answerUser: string, scoreUser: number){
        const answer = await gameService.sendAnswers(userId, {answer: answerUser})
        expect(answer).toBeNull()
        const result = await gameService.getCurrentGame(userId)
        expect(result).toBeNull()
        const game = await gameService.getGameById(userId, gameId)
        const currentPlayer = (game!.firstPlayer.user.id === userId.toString()) ? game!.firstPlayer : game!.secondPlayer
        expect(game!.status).toBe(GameStatuses.FINISH)
        expect(game!.finishGameDate).not.toBeNull()
        expect(currentPlayer.user.id).toBe(userId.toString())
        expect(currentPlayer.score).toBe(scoreUser)
    }
    async function getStaticGamesTest(userId: ObjectId, gameId: ObjectId, scoreFirstUser: number, scoreSecondUser: number){
        const result = await gameService.getStaticGames(userId, {PageNumber: "1", PageSize: "10"})
        expect(result?.totalCount).toBe(1)
        expect(result?.page).toBe(1)
        expect(result?.pagesCount).toBe(1)
        expect(result?.pageSize).toBe(10)
        expect(result?.items.length).toBe(1)
        expect(result?.items).toEqual([{
            id: gameId.toString(),
            firstPlayer: {
                answers: expect.any(Array),
                user: {
                    id:	user1._id.toString(),
                    login: user1.accountData.userName
                },
                score: scoreFirstUser,
                endTime: expect.any(Number)
            },
            secondPlayer: {
                answers: expect.any(Array),
                user: {
                    id:	user2._id.toString(),
                    login: user2.accountData.userName
                },
                score: scoreSecondUser,
                endTime: expect.any(Number)
            },
            questions: expect.any(Array),
            status: GameStatuses.FINISH,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String),
        }])
    }

})


