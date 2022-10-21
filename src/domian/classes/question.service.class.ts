import {ObjectId} from "mongodb";
import {QuestionDto} from "../dto/QuestionDto";

export class QuestionServiceClass{
    _id: ObjectId
    question: string
    answer: string
    constructor(
        public createParam: QuestionDto,
    ) {
        this._id = new ObjectId()
        this.question = createParam.body
        this.answer = createParam.answer
    }
}