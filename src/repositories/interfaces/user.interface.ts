import {ObjectId} from "mongodb";
import {TopGamePlayerViewModel, UserViewModel} from "../../domian/types/user.type";

export enum LikeStatus{
    NONE = 'None',
    LIKE = 'Like',
    DISLIKE = 'Dislike'
}

export interface ILikes{
    id: string,
    myStatus: LikeStatus
}

export interface IUser{
    _id: ObjectId
    accountData:{
        userName: string,
        email: string,
        passwordHash: string,
        createAt: Date
    }
    emailConfirmation:{
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean,
    }
    sessions:{
        refreshToken: string | null,
        badTokens: Array<string>
    }
    likeEvent:{
        postsLikes:Array<ILikes>
        commentsLikes:Array<ILikes>
    }
    gameStatistic:{
        gamePlayedId: Array<string>,
        sumScore: number,
        avgScores: number,
        gamesCount: number,
        winsCount: number,
        lossesCount: number
    }
}