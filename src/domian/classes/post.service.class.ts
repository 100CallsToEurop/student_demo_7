import {ObjectId} from "mongodb";
import {PostDto} from "../dto/post.dto";

export class PostClass{
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    bloggerId: string
    addedAt: Date
    extendedLikesInfo
    constructor(
        public createParam: PostDto,
        public bloggerName: string,
    ) {
        this._id = new ObjectId()
        this.title = createParam.title
        this.shortDescription = createParam.shortDescription
        this.content = createParam.content
        this.bloggerId = createParam.bloggerId
        this.addedAt = new Date()
        this.extendedLikesInfo = {
            likesCount: 0,
            dislikesCount: 0,
            newestLikes: []
        }
    }
}