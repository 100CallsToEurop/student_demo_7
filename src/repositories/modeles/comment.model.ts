import mongoose from "mongoose";
import {IComment} from "../interfaces/comment.interface";

const commentSchema = new mongoose.Schema<IComment>({
    userId: String,
    content: String,
    userLogin: String,
    addedAt: String,
    postId: String,
    likesInfo:{
        likesCount: {type: Number, default: 0},
        dislikesCount: {type: Number, default: 0},
    }
});

export const CommentModel = mongoose.model<IComment>('comments', commentSchema)