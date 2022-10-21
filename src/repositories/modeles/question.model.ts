import mongoose from "mongoose";
import {IQuestionInterface} from "../interfaces/question.interface";

const questionSchema = new mongoose.Schema<IQuestionInterface>({
    question: String,
    answer: String
})

export const QuestionModel = mongoose.model<IQuestionInterface>('question', questionSchema)