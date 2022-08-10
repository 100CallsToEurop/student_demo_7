import {Request, Response, NextFunction} from "express";
const auth = {login: 'admin', password: 'qwerty'}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const typeAuth = (req.headers.authorization || '').split(' ')[0] || ''
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    if(login && password && login === auth.login && password === auth.password && typeAuth === 'Basic'){
        next();
    }
    else res.status(401).send(401)
}
