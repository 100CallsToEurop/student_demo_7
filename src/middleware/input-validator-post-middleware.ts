import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";

export const inputValidatorPostMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(404).json({
            errorsMessages: errors.array({onlyFirstError: true}).map(e =>{
                return{
                    message: e.msg,
                    field: e.param
                }
            })
        })
    }
    else next()
}