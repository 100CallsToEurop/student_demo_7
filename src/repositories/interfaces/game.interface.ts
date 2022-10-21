import {ObjectId} from "mongodb";
import {
    GameStatuses,
} from "../../domian/types/game.type";
import {UserViewModel} from "../../domian/types/user.type";
import {AnswerViewModel, QuestionViewModel} from "../../domian/types/question.type";

export interface IPlayer{
    answers: Array<AnswerViewModel>,
    user: UserViewModel,
    score: number
    endTime: number
}

export interface IGame{
    _id: ObjectId
    firstPlayer: IPlayer,
    secondPlayer: IPlayer,
    questions: Array<QuestionViewModel>,
    status: GameStatuses,
    pairCreatedDate: Date
    startGameDate: Date | null
    finishGameDate: Date | null
}