import "reflect-metadata"
import {injectable} from "inversify";
import {IGame} from "./interfaces/game.interface";
import {GameModel} from "./modeles/game.model";
import {ObjectId} from "mongodb";
import {Query} from "./types/query.type";
import {GameStatuses} from "../domian/types/game.type";

@injectable()
export class GameRepository {

    async createGame(createParam: IGame) {
        const gameInstance = new GameModel(createParam)
        await gameInstance.save()
        return gameInstance
    }

    async findPaddingGame(): Promise<IGame | null>{
        return GameModel.findOne().where({status: GameStatuses.PENDING})
    }

    async findPaddingCurrentGame(userId: string): Promise<IGame | null> {
        return GameModel.findOne().where(
            {$and:[{$or: [
                        {"firstPlayer.user.id": userId},
                        {"secondPlayer.user.id": userId}
                    ]}, {status: GameStatuses.PENDING}
                ]})
    }

    async findActiveGame(userId: string): Promise<IGame | null> {
        return GameModel.findOne().where(
            {$and:[{$or: [
                            {"firstPlayer.user.id": userId},
                            {"secondPlayer.user.id": userId}
                        ]}, {status: GameStatuses.ACTIVE}
                ]})
    }

    async updateGame(_id: ObjectId, updateUserInfo: IGame): Promise <IGame | null>{
        return GameModel.findOneAndUpdate({_id}, updateUserInfo, {
            returnOriginal: false
        })
    }

     async getGameById(_id: ObjectId, userId: string): Promise<IGame | null> {
        return GameModel.findOne({_id}).where({ $or:[
            {"firstPlayer.user.id": userId},
            {"secondPlayer.user.id": userId}
            ]})
    }

    async getAllGamesUserById(userId: string, queryParams: Query) {
        const filter = GameModel.find().where({"or":[{
            "firstPlayer.user.id": userId,
            "secondPlayer.user.id": userId
        }]})
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return GameModel.find(filter).skip(skip).limit(pageSize).lean()
    }

    async getAllGame(){
        return GameModel.find()
    }
}