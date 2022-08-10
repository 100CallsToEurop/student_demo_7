import "reflect-metadata"

import {ObjectId} from "mongodb";

import {injectable} from "inversify";
import {BloggersRepository} from "../repositories/bloggers-repository-db";
import {BloggerQuery, BloggerViewModel, PaginationBloggers} from "./types/blogger.type";
import {BloggerServiceClass} from "./classes/blogger.service.class";
import {BloggerDto} from "./dto/blogger.dto";

@injectable()
export class BloggersService{
    constructor(
        private bloggersRepository: BloggersRepository
    ) {}

    async createBlogger(createParam: BloggerDto): Promise<BloggerViewModel>{
        const {name, youtubeUrl} = createParam
        const newBlogger = new BloggerServiceClass(
            new ObjectId(),
            name,
            youtubeUrl
        )
        await this.bloggersRepository.createBlogger(newBlogger)
        return {
            id: newBlogger._id.toString(),
            name: newBlogger.name,
            youtubeUrl: newBlogger.youtubeUrl
        }
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
            items: items.map(item =>{
                return{
                    id: item._id.toString(),
                    name: item.name,
                    youtubeUrl: item.youtubeUrl
                }
            })
        }

    }
    async getBloggerById(id: ObjectId): Promise<BloggerViewModel | null> {
        const blogger = await this.bloggersRepository.getBloggerById(id)
        if(!blogger) return null
        return {
            id: blogger._id.toString(),
            name: blogger.name,
            youtubeUrl: blogger.youtubeUrl
        }
    }
    async deleteBloggerById(id: ObjectId): Promise<boolean> {
        return await this.bloggersRepository.deleteBloggerById(id)
    }
}
