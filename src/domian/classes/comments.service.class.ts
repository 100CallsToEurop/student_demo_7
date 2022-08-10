import {ObjectId} from "mongodb";

export class CommentServiceClass {
    constructor(
        public _id: ObjectId,
        public userId: string,
        public content: string,
        public userLogin: string,
        public addedAt: string,
        public postId: string,
        public likesInfo: {
            likesCount: number
            dislikesCount: number
        }
    ) {
    }
}