import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {ObjectId} from "mongodb";

export const inputValidatorPostMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if(!ObjectId.isValid(req.params.postId)){
        res.status(404).send("Not found")
    }
    next()
    return
}