import {container} from "../composition-root";

import {QuestionController} from "../controllers/question.controller";
import {Router} from "express";

const questionController = container.resolve(QuestionController)

export const questionRouter = Router({})

questionRouter.post('/', questionController.createQuestion.bind(questionController))

questionRouter.get('/random', questionController.getRandomQuestion.bind(questionController))