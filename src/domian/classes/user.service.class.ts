import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import {GameParam} from "../types/user.type";
import {CreateUserDto} from "../dto/create-user.dto";
import {ILikes} from "../../repositories/interfaces/user.interface";

export class UserServiceClass {
    _id: ObjectId
    accountData
    sessions
    likeEvent
    emailConfirmation
    gameStatistic
    constructor(
        public createParam: CreateUserDto,
        public passwordHash: string,
        public isConfirmed: boolean
    ) {
        this._id = new ObjectId()
        this.accountData={
            userName: createParam.login,
            email: createParam.email,
            passwordHash: this.passwordHash,
            createAt: new Date()
        }
        this.sessions = {
            refreshToken: null,
                badTokens: []
        }
        this.likeEvent = {
            postsLikes:[],
            commentsLikes:[]
        }
        this.emailConfirmation ={
            confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                hours: 1,
                minutes: 3
            }),
                isConfirmed: this.isConfirmed
        }
        this.gameStatistic = {
            gamePlayedId: [],
            sumScore: 0,
            avgScores: 0,
            gamesCount: 0,
            winsCount: 0,
            lossesCount: 0
        }
    }

}