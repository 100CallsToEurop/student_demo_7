import {ObjectId} from "mongodb";

export interface IQuestionInterface {
    _id: ObjectId,
    question: string,
    answer: string
}