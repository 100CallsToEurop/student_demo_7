import {ObjectId} from "mongodb";

export class PostClass{
    constructor(
        public _id: ObjectId,
        public title: string,
        public shortDescription: string,
        public content: string,
        public bloggerId: string,
        public bloggerName: string,
        public extendedLikesInfo: {
           likesCount: number
           dislikesCount: number
           newestLikes: []
    },
    ) {
    }
}