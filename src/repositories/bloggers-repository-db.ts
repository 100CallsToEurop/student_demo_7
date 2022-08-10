import "reflect-metadata"
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {BloggerModel} from "./modeles/blogger.model";
import {IBlogger} from "./interfaces/blogger.interface";
import {PostsModel} from "./modeles/post.model";
import {CommentModel} from "./modeles/comment.model";
import {BloggerQuery} from "../domian/types/blogger.type";
import {BloggerDto} from "../domian/dto/blogger.dto";

@injectable()
export class BloggersRepository{
    async getBloggers(queryParams: BloggerQuery): Promise<IBlogger[]> {
        let filter = BloggerModel.find()
        if(queryParams.SearchNameTerm){
            filter.where("name").regex(queryParams.SearchNameTerm)
        }
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return BloggerModel.find(filter).skip(skip).limit(pageSize).lean()
    }

    async getBloggerById(_id: ObjectId): Promise<IBlogger | null> {
        return BloggerModel.findOne({_id})
    }

    async deleteBloggerById(_id: ObjectId): Promise<boolean> {
        const postInstance = await PostsModel.findOne({bloggerId: _id.toString()})
        if(postInstance){
            const commentInstance = await CommentModel.findOne({postId: postInstance._id})
            if(commentInstance){
                await commentInstance.delete({_id: commentInstance._id})
            }
            await postInstance.delete({bloggerId: _id.toString()})
        }
        const bloggerInstance = await BloggerModel.findOne({_id})
        if(!bloggerInstance) return false
        await bloggerInstance.delete({_id})
        return true
    }
    async updateBloggerById(_id: ObjectId, updateParam: BloggerDto): Promise<boolean | null> {
        const bloggerInstance = await BloggerModel.findOne({_id})
        if(!bloggerInstance) return false
        bloggerInstance.updateOne({}, updateParam)
        await bloggerInstance.save()
        return true
    }
    async createBlogger(createParam: IBlogger): Promise<void>{
        const bloggerInstance = new BloggerModel(createParam)
        await bloggerInstance.save()
    }
}