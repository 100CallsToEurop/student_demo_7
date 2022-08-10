import mongoose from "mongoose";
import {IPost} from "../interfaces/post.interface";


const postSchema = new mongoose.Schema<IPost>({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    bloggerId: { type: String, required: true },
    bloggerName: { type: String, required: true },
    addedAt: {type: Date},
    extendedLikesInfo:{
        likesCount: {type: Number, default: 0},
        dislikesCount: {type: Number, default: 0},
        newestLikes: []
    }
});

export const PostsModel = mongoose.model<IPost>('posts', postSchema)