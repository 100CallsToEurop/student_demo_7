import mongoose from "mongoose";
import {IBlogger} from "../interfaces/blogger.interface";

const bloggerSchema = new mongoose.Schema<IBlogger>({
    name: { type: String, required: true },
    youtubeUrl: { type: String, required: true }
});

export const BloggerModel = mongoose.model<IBlogger>('bloggers', bloggerSchema)