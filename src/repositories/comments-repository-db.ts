import "reflect-metadata"
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {CommentQuery} from "../domian/types/comment.type";
import {IComment} from "./interfaces/comment.interface";
import {CommentModel} from "./modeles/comment.model";
import {CommentDto} from "../domian/dto/comment.dto";


@injectable()
export class CommentsRepository{
    async getComments(queryParams: CommentQuery): Promise<IComment[]>{
        const filter = CommentModel.find().where({postId: queryParams.postId})
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return CommentModel.find(filter).skip(skip).limit(pageSize).lean()

    }
    async getCommentById(_id: ObjectId): Promise<IComment | null>{
        return CommentModel.findOne({_id})
    }

    async deleteCommentById(_id: ObjectId): Promise<boolean> {
        const commentInstance = await CommentModel.findOne({_id})
        if(!commentInstance) return false
        await commentInstance.delete({_id})
        return true
    }

    async updateCommentById(_id: ObjectId, updateComment: CommentDto): Promise<boolean>{
        const commentInstance = await CommentModel.findOne({_id})
        if(!commentInstance) return false
        commentInstance.updateOne({}, updateComment)
        await commentInstance.save()
        return true
    }

    async createComments(createParam: IComment){
        const commentInstance = new CommentModel(createParam)
        await commentInstance.save()
        return createParam
    }

    async likeComment(_id: ObjectId){
        const commentInstance = await CommentModel.findOne({_id})
        if(!commentInstance) return null
        const count = commentInstance.likesInfo.likesCount++
        commentInstance.updateOne({}, {"likesInfo.likesCount": count})
        await commentInstance.save()
        return true
    }

    async dislikeComment(_id: ObjectId){
        const commentInstance = await CommentModel.findOne({_id})
        if(!commentInstance) return null
        const count = commentInstance.likesInfo.dislikesCount++
        commentInstance.updateOne({}, {"likesInfo.dislikesCount": count})
        await commentInstance.save()
        return true
    }

    async unLikeComment(_id: ObjectId){
        const commentInstance = await CommentModel.findOne({_id})
        if(!commentInstance) return null
        const count = commentInstance.likesInfo.likesCount--
        commentInstance.updateOne({}, {"likesInfo.likesCount": count})
        await commentInstance.save()
        return true
    }

    async unDislikeComment(_id: ObjectId){
        const commentInstance = await CommentModel.findOne({_id})
        if(!commentInstance) return null
        const count = commentInstance.likesInfo.dislikesCount--
        commentInstance.updateOne({}, {"likesInfo.dislikesCount": count})
        await commentInstance.save()
        return true
    }
}