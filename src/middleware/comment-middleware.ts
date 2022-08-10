import {body} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {ObjectId} from "mongodb";

export const commentValidation = body('content')
    .exists()
    .notEmpty()
    .isLength({min: 20, max: 100})
    .withMessage('Max 100 symbols')

export const statusForLike = body('likeStatus')
    .isString()
    .exists()
    .isIn(['None' , 'Like' , 'Dislike'])

export const inputValidatorCommentMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if(!ObjectId.isValid(req.params.commentId)){
        res.status(404).send("Not found")
    }
    next()
    return
}

