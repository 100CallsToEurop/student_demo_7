import "reflect-metadata"
import {injectable} from "inversify";
import {BloggersService} from "..//domian/bloggers.service";
import {Request, Response} from "express";
import {ObjectId} from "mongodb";
import {PostsService} from "../domian/posts.services";
import {BloggerPostInputModel, BloggerQuery} from "../domian/types/blogger.type";
import {BloggerDto} from "../domian/dto/blogger.dto";
import {PostQuery} from "../domian/types/post.type";

@injectable()
export class BloggerController{
    constructor(
        private bloggersService: BloggersService,
        private postsService: PostsService
    ) {}

    async getBloggers(req: Request<{ SearchNameTerm: string, PageNumber: string, PageSize: string }>, res: Response){
        const {SearchNameTerm, PageNumber, PageSize}: BloggerQuery = req.query
        const bloggers = await this.bloggersService.getBloggers({ SearchNameTerm, PageNumber, PageSize})
        res.status(200).json(bloggers)
    }

    async getBlogger(req: Request<{id: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        const blogger = await this.bloggersService.getBloggerById(id)
        if (blogger) {
            res.status(200).json(blogger)
            return
        }
        res.status(404).send('Not found')
    }

    async deleteBlogger(req: Request<{id: string}>, res: Response){
        const id = new ObjectId(req.params.id)
        if (await this.bloggersService.deleteBloggerById(id)) {
            res.status(204).send('No Content')
            return
        }
        res.status(404).send('Not found')
    }

    async createBlogger(req: Request<{name: string, youtubeUrl: string}>, res: Response){
        const {name, youtubeUrl}: BloggerDto = req.body
        const newBloger = await this.bloggersService.createBlogger({name, youtubeUrl})
        if(newBloger) {
            res.status(201).json(newBloger)
            return
        }
        res.status(400).send('Bad request')
    }

    async updateBlogger(req: Request<{ id: string }>, res: Response){
        const id = new ObjectId(req.params.id)
        const {name, youtubeUrl} = req.body
        const isUpdate = await this.bloggersService.updateBloggerById(id, {name, youtubeUrl})
        if (isUpdate) {
            const blogger = await this.bloggersService.getBloggerById(id)
            res.status(204).json(blogger)
            return
        }
        res.status(404).send('NotFound')
    }

    async getBloggerPosts(req: Request<{bloggerId: string}, {PageNumber: string, PageSize: string}>, res: Response){
        const id = req.params.bloggerId
        const {PageNumber, PageSize}: PostQuery = req.query
        const currentUserId = new ObjectId(req.user!._id)
        const bloggerPosts = await this.postsService.getPosts(currentUserId, {id, PageNumber, PageSize})
        if (bloggerPosts) {
            res.status(200).json(bloggerPosts)
            return
        }
        res.status(404).send('Not found')
    }

    async createBloggerPost(req: Request<{bloggerId: string}, {title: string, shortDescription: string, content: string}>, res: Response){
        const bloggerId = req.params.bloggerId
        const {title, shortDescription, content}: BloggerPostInputModel  = req.body
        const newBlogPost = await this.postsService.createPost({title, shortDescription, content, bloggerId})
        if(newBlogPost) {
            res.status(201).send(newBlogPost)
            return
        }
        res.status(404).send('Not found')
    }
}