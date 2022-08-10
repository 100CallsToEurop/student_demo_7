import {ObjectId} from "mongodb";

export class BloggerServiceClass {
    constructor(
        public _id: ObjectId,
        public name: string,
        public youtubeUrl: string
    ) {
    }

}