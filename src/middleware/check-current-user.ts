import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {jwtService} from "../applications/jwt-service";
import {usersRepository} from "../repositories/users.repository";
import {Guest} from "../repositories/types/user.declare.types";

export const checkCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    const guest: Guest = {
        _id: "72f34508e52cffd123830723"
    }

    if(req.headers.authorization){

        const token = req.headers.authorization.split(" ")[1]
        const user = await jwtService.decodeToken(token)
        if(user){

            req.user = await usersRepository.findUserById(new ObjectId(user.userId))
            next()
            return
        }
        else{

            req.user = guest
            next()
            return
        }
    }

        req.user = guest
        next()
        return


}


