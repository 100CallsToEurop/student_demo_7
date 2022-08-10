import {body} from "express-validator";

export const nameValidation = body('name')
    .trim()
    .exists()
    .notEmpty()
    .isLength({max: 15})
    .withMessage('Max 15 symbols')

export const titleValidation = body('youtubeUrl')
    .exists()
    .notEmpty()
    .isURL()
    .isLength({max: 100})
    .withMessage('Max 100 symbols')