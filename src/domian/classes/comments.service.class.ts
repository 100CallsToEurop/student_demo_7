import {ObjectId} from "mongodb";

export class CommentServiceClass {
    _id: ObjectId
    addedAt: Date
    likesInfo
    constructor(
        public userId: string,
        public content: string,
        public userLogin: string,
        public postId: string,

    ) {
        this._id = new ObjectId()
        this.addedAt = new Date()
        this.likesInfo = {
            likesCount: 0,
            dislikesCount: 0
        }
    }
}