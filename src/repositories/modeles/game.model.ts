import mongoose from "mongoose";
import {IGame} from "../interfaces/game.interface";
import {
    GameStatuses,
} from "../../domian/types/game.type";

const gameSchema = new mongoose.Schema<IGame>({
    firstPlayer: {
        answers: [],
        user: {
            id: String,
            login: String
        },
        score: Number,
        endTime: Number
    },
    secondPlayer: {
        answers: [],
        user: {
            id: String,
            login: String
        },
        score: Number,
        endTime: Number
    },
    questions: [{
        id: String,
        body: String
    }],
    status: {type: String, enum: GameStatuses},
    pairCreatedDate: {type: Date},
    startGameDate: {type: Date},
    finishGameDate: {type: Date},
})

export const GameModel = mongoose.model<IGame>('games', gameSchema)