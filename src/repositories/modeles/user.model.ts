import mongoose from "mongoose";
import {IUser} from "../interfaces/user.interface";

const userSchema = new mongoose.Schema<IUser>({
    accountData:{
        userName: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        createAt: { type: Date, required: true },
    },
    emailConfirmation:{
        confirmationCode: { type: String, required: true },
        expirationDate: { type: Date, required: true },
        isConfirmed: { type: Boolean, required: true },
    },
    sessions:{
        refreshToken: { type: String, default: null },
        badTokens: [String]
    },
    likeEvent:{
        postsLikes:[],
        commentsLikes:[]
    },
    gameStatistic:{
        gamePlayedId: [String],
        sumScore: Number,
        avgScores: Number,
        gamesCount: Number,
        winsCount: Number,
        lossesCount: Number
    }
});

export const UserModel = mongoose.model<IUser>('users', userSchema)