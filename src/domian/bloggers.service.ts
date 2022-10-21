import "reflect-metadata"

import {ObjectId} from "mongodb";

import {injectable} from "inversify";
import {BloggersRepository} from "../repositories/bloggers-repository-db";
import {BloggerQuery, BloggerViewModel, PaginationBloggers} from "./types/blogger.type";
import {BloggerServiceClass} from "./classes/blogger.service.class";
import {BloggerDto} from "./dto/blogger.dto";
import {IBlogger} from "../repositories/interfaces/blogger.interface";

@injectable()
export class BloggersService{
    constructor(
        private bloggersRepository: BloggersRepository
    ) {}

    buildResponseBlogger(blogger: IBlogger): BloggerViewModel{
        return {
            id: blogger._id.toString(),
            name: blogger.name,
            youtubeUrl: blogger.youtubeUrl
        }
    }

    async createBlogger(createParam: BloggerDto): Promise<BloggerViewModel>{
        const newBlogger = new BloggerServiceClass(createParam)
        await this.bloggersRepository.createBlogger(newBlogger)
        return this.buildResponseBlogger(newBlogger)
    }

    async updateBloggerById(id: ObjectId, updateParam: BloggerDto): Promise<boolean |  null> {
        return await this.bloggersRepository.updateBloggerById(id, updateParam)
    }

    async getBloggers(queryParams: BloggerQuery): Promise<PaginationBloggers> {
        const items = await this.bloggersRepository.getBloggers(queryParams)
        const totalCount = items.length
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const pagesCount = Math.ceil(totalCount/pageSize)
        return{
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map(item => this.buildResponseBlogger(item))
        }

    }
    async getBloggerById(id: ObjectId): Promise<BloggerViewModel | null> {
        const blogger = await this.bloggersRepository.getBloggerById(id)
        if(!blogger) return null
        return this.buildResponseBlogger(blogger)
    }
    async deleteBloggerById(id: ObjectId): Promise<boolean> {
        return await this.bloggersRepository.deleteBloggerById(id)
    }
}
