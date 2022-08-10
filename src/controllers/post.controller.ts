import "reflect-metadata"
import {injectable} from "inversify";
import {CommentService} from "../domian/comments.service";
import {Request, Response} from "express";
import {PostsService} from "../domian/posts.services";

import {ObjectId} from "mongodb";
import {PostQuery} from "../domian/types/post.type";
import {CommentQuery} from "../domian/types/comment.type";
import {UserViewModel} from "../domian/types/user.type";
import {likeStatus} from "../domian/types/comment.type";


@injectable()
export class PostsController{
    constructor(
        private postsService: PostsService,
        private commentsService: CommentService,
                ){}

    async getPost(req: Request<{id: string}>, res: Response){
        const id = new ObjectId(req.params.id);
        const currentUserId = new ObjectId(req.user!._id)
        const post = await this.postsService.getPostById(currentUserId, id)
        if(post) {
            res.status(200).send(post)
            return
        }
        res.status(404).send('Not found')
    }

    async getPosts(req: Request<{ PageNumber: string, PageSize: string }>, res: Response){
        const {PageNumber, PageSize}: PostQuery = req.query
        const currentUserId = new ObjectId(req.user!._id)
        const posts = await this.postsService.getPosts(currentUserId, {PageNumber, PageSize})
        res.status(200).json(posts)
    }

    async deletePost(req: Request<{id: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        if (await this.postsService.deletePostById(id)) {
            res.status(204).send('No Content')
            return
        }
        res.status(404).send('Not found')
    }

    async updatePost(req: Request<{id: string}, {title: string, shortDescription: string, content: string, bloggerId: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        const {title, shortDescription, content, bloggerId }  = req.body
        const currentUserId = new ObjectId(req.user!._id)
        const isUpdate = await this.postsService.updatePostById(id, {title, shortDescription, content, bloggerId })
        if(isUpdate === null) {
            res.status(400).send({errorsMessages: [{message: "Not found", field: "bloggerId"}]})
            return
        }
        if (isUpdate) {
            const blogger = await this.postsService.getPostById(currentUserId, id)
            res.status(204).send(blogger)
            return
        }
        res.status(404).send('NotFound')
    }

    async createPost(req: Request<{title: string, shortDescription: string, content: string, bloggerId: string}>, res: Response){
        const {title, shortDescription, content, bloggerId}  = req.body
        const newPosts = await this.postsService.createPost({title, shortDescription, content, bloggerId})
        if(newPosts === null) {
            res.status(400).send({errorsMessages: [{message: "Not found", field: "bloggerId"}]})
            return
        }
        if(newPosts) {
            res.status(201).send(newPosts)
            return
        }
        res.status(404).send('Not found')
    }

    async getComments(req: Request<{postId: string}, {PageNumber: string, PageSize: string}>, res: Response){
        const postId = req.params.postId
        const currentUserId = req.user!._id
        const {PageNumber, PageSize}: CommentQuery = req.query
        const comments = await this.commentsService.getComments(new ObjectId(currentUserId), {postId, PageNumber, PageSize})
        if (comments) {
            res.status(200).json(comments)
            return
        }
        res.status(404).send('Not found')
    }

    async createComment(req: Request<{postId: string}, {content: string, user: UserViewModel}>, res: Response){
        const postId = new ObjectId(req.params.postId)
        const {content}  = req.body
        if(req.user!._id === "72f34508e52cffd123830723"){
            res.status(403).send('Forbidden')
            return
        }
        const newComments = await this.commentsService.createComment(new ObjectId(req.user!._id), postId,{content})
        if(newComments) {
            res.status(201).send(newComments)
            return
        }
        else{
            res.status(404).send('Not found')
            return
        }
    }

    async updatePostLike(req: Request<{postId: string}, {likeStatus: string}>, res: Response){
        const postId = new ObjectId(req.params.postId)
        const currentUserId = new ObjectId(req.user!._id)
        const {likeStatus}: likeStatus = req.body
        const checkPost = await this.postsService.getPostById(currentUserId, postId)
        if(checkPost === null) {
            res.status(404).send('Not found')
            return
        }
        const isUpdate = await this.postsService.updateLikeForPost(currentUserId, postId, {likeStatus})
        if (isUpdate) {
            res.status(204).send('No Content')
            return
        }
        res.status(404).send('Not found')
    }

}