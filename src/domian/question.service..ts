import "reflect-metadata"
import {injectable} from "inversify";
import {AnswerStatus, AnswerViewModel, QuestionViewModel} from "./types/question.type";
import {QuestionRepository} from "../repositories/question-repository";
import {QuestionDto} from "./dto/QuestionDto";
import {QuestionServiceClass} from "./classes/question.service.class";
import {ObjectId} from "mongodb";
import {IQuestionInterface} from "../repositories/interfaces/question.interface";

@injectable()
export class QuestionService{

    constructor(public questionsRepository: QuestionRepository) {
    }

    async createQuestion(createParam: QuestionDto){
        const newQuestion = new QuestionServiceClass(createParam)
        await this.questionsRepository.createQuestion(newQuestion)
        return{
            id: newQuestion._id.toString(),
            question: newQuestion.question,
            answer: newQuestion.answer
        }
    }

    async getQuestionById(id: ObjectId): Promise <IQuestionInterface | null>{
        return await this.questionsRepository.getQuestionById(id)
    }

    async getQuestionByAnswer(id: ObjectId, answer: string): Promise <AnswerViewModel | null>{
        const question = await this.questionsRepository.getQuestionByAnswer(id, answer)
        if(question) {
            return {
                questionId: id.toString(),
                answerStatus: AnswerStatus.CORRECT,
                addedAt: new Date().toDateString()
            }
        }
        return {
            questionId: id.toString(),
            answerStatus: AnswerStatus.INCORRECT,
            addedAt: new Date().toDateString()
        }
    }

    async getFiveRandomQuestions(countQuestion: number): Promise<QuestionViewModel[]>{
        const items = await this.questionsRepository.getFiveRandomQuestions(countQuestion)
        return items.map(item =>{
            return{
                id: item._id.toString(),
                body: item.question
            }
        })
    }
}