import "reflect-metadata"
import {injectable} from "inversify";
import {Request, Response} from "express";
import {ObjectId} from "mongodb";
import {CommentService} from "../domian/comments.service";
import {likeStatus} from "../domian/types/comment.type";
import {CommentDto} from "../domian/dto/comment.dto";


@injectable()
export class CommentController{

    constructor(private commentsService: CommentService) {}

    async getComment(req: Request, res: Response){
        const id = new ObjectId(req.params.id)
        const currentUserId = new ObjectId(req.user!._id)
        const comment = await this.commentsService.getCommentById(currentUserId, id)
        if (comment) {
            res.status(200).json(comment)
            return
        }
        res.status(404).send('Not found')
    }

    async updateComment(req: Request<{ commentId: string }>, res: Response){
        const id = new ObjectId(req.params.commentId)
        const {content}: CommentDto = req.body
        if(req.user!._id === "72f34508e52cffd123830723"){
            res.status(403).send('Forbidden')
            return
        }
        const myComment = await this.commentsService.checkCommentById(new ObjectId(req.user!._id), id)
        if(myComment === null) {
            res.status(404).send('Not found')
            return
        }
        if(myComment === false) {
            res.status(403).send(403)
            return
        }
        const isUpdate = await this.commentsService.updateCommentById(id,{content})
        if (isUpdate) {
            res.status(204).send('No Content')
            return
        }
        res.status(404).send('Not found')
    }

    async deleteComment(req: Request<{commentId: string}>, res: Response){
        const commentId = new ObjectId(req.params.commentId)
        if(req.user!._id === "72f34508e52cffd123830723"){
            res.status(403).send('Forbidden')
            return
        }
        const myComment = await this.commentsService.checkCommentById(new ObjectId(req.user!._id), commentId)
        if(myComment === null) {
            res.status(404).send('Not found')
            return
        }
        if(myComment === false) {
            res.status(403).send(403)
            return
        }
        await this.commentsService.deleteCommentById(commentId)
        res.status(204).send('No Content')
        return
    }

    async updateCommentLike(req: Request<{commentId: string}, {likeStatus: string}>, res: Response){
        const commentId = new ObjectId(req.params.commentId)
        const currentUserId = new ObjectId(req.user!._id)
        const {likeStatus}: likeStatus = req.body
        const checkComment = await this.commentsService.getCommentById(currentUserId, commentId)
        if(checkComment === null) {
            res.status(404).send('Not found')
            return
        }
        const isUpdate = await this.commentsService.updateLikeForComment(currentUserId, commentId, {likeStatus})
        if (isUpdate) {
            res.status(204).send('No Content')
            return
        }
        res.status(404).send('Not found')
    }
}