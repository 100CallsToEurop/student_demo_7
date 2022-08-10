
import {Pagination} from "../../repositories/types/pagination.types";
import {Query} from "../../repositories/types/query.type";
import {LikeStatus} from "../../repositories/interfaces/user.interface";

export type PostInputModel  = {
    title: string,
    shortDescription: string,
    content: string,
    bloggerId: string,
}

export type LikeDetails = {
    addedAt: Date,
    userId: string,
    login: string
}


export type PostViewModel = PostInputModel & {
    id: string,
    bloggerName: string
    addedAt: string
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatus,
        newestLikes: LikeDetails[] | []

    }
}

export type PostQuery = Query & {
    id?: string,
}

export type PaginationPosts = Pagination & {
    items: Awaited<PostViewModel[]>
}

