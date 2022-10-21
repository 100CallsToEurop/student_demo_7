import "reflect-metadata"
import {injectable} from "inversify";
import {ObjectId} from "mongodb";
import {IQuestionInterface} from "./interfaces/question.interface";
import {QuestionModel} from "./modeles/question.model";
import {Query} from "./types/query.type";


@injectable()
export class QuestionRepository{
    async createQuestion(createParam: IQuestionInterface): Promise<void>{
        const question = new QuestionModel(createParam)
        await question.save()
    }

    async getFiveRandomQuestions(countQuestion: number): Promise<IQuestionInterface[]>{
        const filter = QuestionModel.find()
        const totalCount = filter.countDocuments()
        const pageSize = Number(countQuestion) || 5
        const pagesCount = Math.ceil(Number(totalCount) / pageSize)
        const page = Math.floor(Math.random() * pagesCount)
        const skip: number = (page-1) * pageSize
        return QuestionModel.find().skip(skip).limit(pageSize).lean()
    }

    async getQuestions(queryParams: Query): Promise<IQuestionInterface[]>{
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return QuestionModel.find().skip(skip).limit(pageSize).lean()
    }

    async getQuestionById(_id: ObjectId): Promise<IQuestionInterface | null>{
        return QuestionModel.findOne({_id})
    }

    async getQuestionByAnswer(_id: ObjectId, answer: string): Promise<IQuestionInterface | null>{
        return QuestionModel.findOne({_id}).where({answer: answer})
    }

    async updateQuestion(_id: ObjectId, updateParam: IQuestionInterface): Promise<IQuestionInterface | null>{
        const question = await QuestionModel.findOne({_id})
        if(!question) return null
        question.updateOne({}, updateParam)
        await question.save()
        return updateParam
    }

    async deleteQuestion(_id: ObjectId): Promise<boolean>{
        const question = await QuestionModel.findOne({_id})
        if(!question) return false
        await question.delete({_id})
        return true
    }
}