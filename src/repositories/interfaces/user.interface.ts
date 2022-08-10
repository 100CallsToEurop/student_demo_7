import {ObjectId} from "mongodb";

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
}