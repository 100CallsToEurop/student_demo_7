import {ObjectId} from "mongodb";

export interface LikeDetails{
    addedAt: Date,
    userId: string,
    login: string
}

export interface IPost{
    _id: ObjectId
    title: string,
    shortDescription: string,
    content: string,
    bloggerId: string,
    bloggerName: string,
    addedAt: Date,
    extendedLikesInfo:{
        likesCount: number
        dislikesCount: number
        newestLikes: Array<LikeDetails>
    }
}