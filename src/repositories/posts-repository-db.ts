import "reflect-metadata"
import {ObjectId} from "mongodb";

import {injectable} from "inversify";
import {IPost} from "./interfaces/post.interface";
import {LikeDetails, PostQuery} from "../domian/types/post.type";
import {PostsModel} from "./modeles/post.model";
import {CommentModel} from "./modeles/comment.model";
import {PostDto} from "../domian/dto/post.dto";

@injectable()
export class PostsRepository{
    async getPosts(queryParams: PostQuery): Promise<IPost[]> {
        let filter = PostsModel.find()
        if(queryParams.id !== undefined){
            filter = PostsModel.find().where({bloggerId: queryParams.id})
        }
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return PostsModel.find(filter).skip(skip).limit(pageSize).lean()
    }

    async getPostById(_id: ObjectId): Promise< IPost| null> {
        return PostsModel.findOne({_id})
    }

    async deletePostById(_id: ObjectId): Promise<boolean> {
        const commentInstance = await CommentModel.findOne({postId: _id.toString()})
        if(commentInstance){
            await commentInstance.delete({postId: _id.toString()})
        }
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return false
        await postInstance.delete({bloggerId: _id.toString()})
        return true
    }

    async updatePostById(_id: ObjectId, updateParam: PostDto): Promise<boolean> {
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return false
        postInstance.updateOne({}, updateParam)
        await postInstance.save()
        return true
    }

    async createPost(createParam: IPost): Promise<void> {
        const postInstance = new PostsModel(createParam)
        await postInstance.save()
    }

    async likePost(_id: ObjectId){
        const commentInstance = await PostsModel.findOne({_id})
        if(!commentInstance) return null
        const count = commentInstance.extendedLikesInfo.likesCount++
        commentInstance.updateOne({}, {"extendedLikesInfo.likesCount": count})
        await commentInstance.save()
        return true
    }

    async dislikePost(_id: ObjectId){
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return null
        const count = postInstance.extendedLikesInfo.dislikesCount++
        postInstance.updateOne({}, {"extendedLikesInfo.dislikesCount": count})
        await postInstance.save()
        return true
    }

    async unLikePost(_id: ObjectId){
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return null
        const count = postInstance.extendedLikesInfo.likesCount--
        postInstance.updateOne({}, {"extendedLikesInfo.likesCount": count})
        await postInstance.save()
        return true
    }

    async unDislikePost(_id: ObjectId){
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return null
        const count = postInstance.extendedLikesInfo.dislikesCount--
        postInstance.updateOne({}, {"extendedLikesInfo.dislikesCount": count})
        await postInstance.save()
        return true
    }

    async getLastThreeUsers(_id: ObjectId){
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return null
        if(postInstance.extendedLikesInfo.newestLikes.length > 3) {
            const result = postInstance.extendedLikesInfo.newestLikes.slice(-3).reverse()
            return result
        }
        return postInstance.extendedLikesInfo.newestLikes.reverse()
    }

    async addLastLikeUser(_id: ObjectId, userInfo: LikeDetails) {
        const postInstance = await PostsModel.findOne({_id})
        if (!postInstance) return null
        postInstance.extendedLikesInfo.newestLikes.push(userInfo)
        postInstance.markModified('extendedLikesInfo')
        await postInstance.save()
    }

    async popTopUser(_id: ObjectId, userId: string){
        const postInstance = await PostsModel.findOne({_id})
        if(!postInstance) return null
        postInstance.extendedLikesInfo.newestLikes = postInstance.extendedLikesInfo.newestLikes.filter(el =>{
            return el.userId !== userId
        })
        postInstance.markModified('extendedLikesInfo')
        await postInstance.save()
        return true
    }

}