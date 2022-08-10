
import {ObjectId} from "mongodb";
import {LikeStatus} from "../../repositories/interfaces/user.interface";
import {Query} from "../../repositories/types/query.type";
import {Pagination} from "../../repositories/types/pagination.types";


export type CommentInputModel = {
    content: string
}

export type likeStatus = {
    likeStatus: LikeStatus
}
export type CommentViewModel={
    id: string,
    userId: string,
    content: string,
    userLogin: string,
    addedAt: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatus
    }
}

export type CommentModel = {
    _id: ObjectId
    userId: string
    content: string
    userLogin: string
    addedAt: string
    postId: string
}

export type CommentQuery = Query & {
    postId?: string
}

export type PaginationComments = Pagination & {
    items: Awaited<CommentViewModel>[]
}
