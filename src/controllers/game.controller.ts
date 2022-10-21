import "reflect-metadata"
import {injectable} from "inversify";
import {GameService} from "../domian/game.service";
import {Request, Response} from "express";
import {ObjectId} from "mongodb";
import {Query} from "../repositories/types/query.type";

@injectable()
export class GameController {
    constructor(private gameService: GameService) {}

    async getCurrentGame(req: Request, res: Response) {
        const userId = new ObjectId(req.user!._id)
        const result = await this.gameService.getCurrentGame(userId)
        if(result){
            res.status(200).send(result)
            return
        }
        res.status(404).send(404)
    }

    async getGameById(req: Request<{ id: string }>, res: Response) {
        const userId = new ObjectId(req.user!._id)
        const gameId = new ObjectId(req.params.id)
        const result = await this.gameService.getGameById(userId, gameId)
        if(result){
            res.status(200).send(result)
            return
        }
        if(!result){
            res.status(403).send("Forbidden")
            return
        }
        res.status(404).send(404)
    }

    async getStaticGames(req: Request<{PageNumber: string, PageSize: string}>, res: Response) {
        const userId = new ObjectId(req.user!._id)
        const {PageNumber, PageSize}: Query = req.query
        const result = await this.gameService.getStaticGames(userId, {PageNumber, PageSize})
        if(result){
            res.status(200).send(result)
            return
        }
    }

    async connectionGame(req: Request, res: Response) {
        const userId = new ObjectId(req.user!._id)
        const result = await this.gameService.connectionGame(userId)
        if(result){
            res.status(200).send(result)
            return
        }
        res.status(403).send("Forbidden")
    }

    async sendAnswers(req: Request<{answer: string}>, res: Response) {
        const userId = new ObjectId(req.user!._id)
        const answer = req.body.answer
        const result = await this.gameService.sendAnswers(userId, answer)
        if(result){
            res.status(200).send(result)
            return
        }
        res.status(403).send("Forbidden")
    }

    async getTopUsers(req: Request<{PageNumber: string, PageSize: string}>, res: Response) {
        const {PageNumber, PageSize}: Query = req.query
        const result = await this.gameService.getTopUsers({PageNumber, PageSize})
        res.status(200).send(result)
    }
}