import {Pagination} from "../../repositories/types/pagination.types";
import {Query} from "../../repositories/types/query.type";
import {PostInputModel} from "./post.type";

export type BloggerInputModel = {
    name: string,
    youtubeUrl: string
}
export type BloggerViewModel = BloggerInputModel & {
    id: string,
}

export type BloggerPostInputModel = Omit<PostInputModel, 'bloggerId'>

export type BloggerQuery = Query & {
    SearchNameTerm?: string,
}

export type PaginationBloggers = Pagination & {
    items?: Array<BloggerViewModel>
}