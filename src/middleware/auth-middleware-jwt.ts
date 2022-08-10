import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {jwtService} from "../applications/jwt-service";
import {usersRepository} from "../repositories/users.repository";

export const authMiddlewareJWT = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.headers.authorization){
        res.send(401)
        return
    }

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwtService.decodeToken(token)
    if(user){
        req.user = await usersRepository.findUserById(new ObjectId(user.userId))
        next()
        return
    }
    res.send(401)
}
