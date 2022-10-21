import {ObjectId} from "mongodb";
import {BloggerDto} from "../dto/blogger.dto";

export class BloggerServiceClass {
    _id: ObjectId
    name: string
    youtubeUrl: string
    constructor(public createParam: BloggerDto) {
        this._id = new ObjectId()
        this.name = createParam.name
        this.youtubeUrl = createParam.youtubeUrl
    }

}