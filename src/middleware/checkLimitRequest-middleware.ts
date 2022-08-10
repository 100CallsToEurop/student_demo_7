import {Request, Response, NextFunction} from "express";

let arr: Array<{ip: string, url: string, date: number}> = []

export const checkLimitReq = async(req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip + '[' + req.headers['x-forwarded-for']+ ']'
    const url = '[' + req.method + ']' + req.originalUrl

    const limits = arr.filter(h => h.ip === ip && h.url === url && h.date > Date.now() - 10 * 1000)

    if(limits.length > 4){
        res.status(429).send(limits)
        return
    }

    arr = [
        ...arr.filter(h => h.date > Date.now() - 10 * 1000),
        {
            date: Date.now(),
            ip,
            url
        }
    ]
    next()
}
