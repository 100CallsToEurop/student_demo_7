import "reflect-metadata"
import {injectable} from "inversify";
import {Request, Response} from "express";
import {QuestionService} from "../domian/question.service.";

@injectable()
export class QuestionController{

    constructor(
        public questionService: QuestionService
    ) {
    }

    async createQuestion(req: Request<{body: string, answer: string}>, res: Response){
        const {body, answer} = req.body
        const newQuestion = await this.questionService.createQuestion({body, answer})
        if (newQuestion) {
            res.status(201).send(newQuestion)
            return
        }
        res.status(400).send('Bad request')
    }

    async getRandomQuestion(req: Request<{countQuestion: string}>, res: Response){
        const {countQuestion} = req.body
        const question = await this.questionService.getFiveRandomQuestions(countQuestion)
        if (question) {
            res.status(201).send(question)
            return
        }
        res.status(400).send('Bad request')
    }
}