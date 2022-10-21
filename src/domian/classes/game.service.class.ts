import {ObjectId} from "mongodb";
import {GameStatuses} from "../types/game.type";
import {QuestionViewModel} from "../types/question.type";
import {UserViewModel} from "../types/user.type";

export class GameServiceClass {
    _id: ObjectId
    firstPlayer
    secondPlayer
    questions: Array<QuestionViewModel>
    status: GameStatuses
    pairCreatedDate: Date
    startGameDate: Date | null
    finishGameDate: Date | null
    constructor(
        public user: UserViewModel
    ) {
        this._id = new ObjectId()
        this.firstPlayer = {
            answers: [],
            user: {
                id: this.user.id,
                login: this.user.login
            },
            score: 0,
            endTime: 0
        }
        this.secondPlayer = {
            answers: [],
                user: {
                id: "pending",
                login: "pending"
            },
            score: 0,
            endTime: 0
        },
        this.questions = []
        this.status = GameStatuses.PENDING
        this.pairCreatedDate = new Date
        this.startGameDate = null
        this.finishGameDate = null
    }
}