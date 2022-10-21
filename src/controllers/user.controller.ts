import "reflect-metadata"
import {UsersService} from "../domian/users.service";
import {Request, Response} from "express";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";

import {Query} from "../repositories/types/query.type";
import {UserInputModel} from "../domian/types/user.type";
import {ILikes} from "../repositories/interfaces/user.interface";



@injectable()
export class UsersController {

    constructor(private usersService: UsersService) {}

    async createUsers(req: Request, res: Response) {
        const {login, email, password}: UserInputModel = req.body
        const newUser = await this.usersService.createUser({login, email, password})
        if (newUser) {
            res.status(201).send(newUser)
            return
        }
        res.status(400).send('Bad request')
    }

    async deleteUser(req: Request<{id: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        if (await this.usersService.deleteUser(id)) {
            res.status(204).send('No Content')
            return
        }
        res.status(404).send('Not found')
    }

    async getUser(req: Request<{id: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        const users = await this.usersService.getUser(id)
        res.status(200).json(users)
    }

    async getUsers(req: Request<{PageNumber: string, PageSize: string}>, res: Response){
        const {PageNumber, PageSize}: Query = req.query
        const users = await this.usersService.getUsers({PageNumber, PageSize})
        res.status(200).json(users)
    }

    //test
    async getCommentStatus(req: Request<{id: string}, {commentId: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        const commentId = req.body.commentId
        const status = await this.usersService.getCommentStatus(id, commentId)
        if(!status) {
            res.status(400).json(400)
            return
        }
        res.status(200).json(status)
    }

    async eventLikeComment(req: Request<{id: string}, {commentId: string, status: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        const commentId = req.body.commentId
        const status = req.body.status
        const success = await this.usersService.eventLikeComment(id, commentId, status)
        if(!success) {
            res.status(400).json(400)
            return
        }
        res.status(200).json(success)
    }

    async setNoneStatusComment(req: Request<{id: string}, {commentId: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        const commentId = req.body.commentId
        const success = await this.usersService.setNoneStatusComment(id, commentId)
        if(!success) {
            res.status(400).json(400)
            return
        }
        res.status(200).json(success)
    }
}
