import {ObjectId} from "mongodb";

export interface IBlogger{
    _id: ObjectId
    name: string
    youtubeUrl: string
}