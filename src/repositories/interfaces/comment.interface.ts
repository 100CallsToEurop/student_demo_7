import {ObjectId} from "mongodb";

export interface IComment{
    _id: ObjectId
    content: string
    userId: string
    userLogin: string
    addedAt: Date
    postId: string
    likesInfo: {
        likesCount: number
        dislikesCount: number
    }
}