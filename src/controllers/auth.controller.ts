import "reflect-metadata"
import {injectable} from "inversify";
import {UsersService} from "../domian/users.service";
import {Request, Response} from "express";
import {AuthService} from "../domian/auth.service";
import {jwtService} from "../applications/jwt-service";
import {UserInputModel} from "../domian/types/user.type";
import {RegistrationConfirmationCodeModel, RegistrationEmailResending} from "../domian/types/registration.type";
import {LoginInputModel} from "../domian/types/login.type";
import {ObjectId} from "mongodb";


@injectable()
export class AuthController{
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        ) {}

    async registrationUsers(req: Request, res: Response){
        const {login, email, password}: UserInputModel = req.body
        const user = await this.authService.createUser({login, email, password})
        if(user){
            res.status(204).send(204)
            return
        }
        res.status(400).send('Bad request')
    }

    async registrationEmailResendingUser(req: Request, res: Response){
        const {email}: RegistrationEmailResending = req.body
        const result = await this.authService.findUserByEmail(email)
        if(result){
            res.status(204).send(204)
            return
        }
        else{
            res.status(400).send({errorsMessages: [{ message: "Bad email", field: "email" }]})
            return
        }
    }

    async registrationConfirmationUser(req: Request, res: Response){
        const {code}: RegistrationConfirmationCodeModel = req.body
        const result = await this.authService.findUserForConfirm(code)
        if(result) {
            res.status(204).send('Email was verified. Account was activated')
            return
        }
        res.status(400).send({errorsMessages: [{ message: "This code already confirmed", field: "code" }]})
    }

    async loginUser(req: Request, res: Response){
        const {login, password}: LoginInputModel = req.body
        const user = await this.authService.checkCredentials({login, password})
        if(user){
            const token = await jwtService.createJWT(user)
            res.cookie('refreshToken', token.refreshToken, {
                maxAge: 20 * 1000,
                httpOnly: true,
                secure: true
            });
            res.status(200).json({"accessToken": token.accessToken})
            return
        }
        res.status(401).send('Unauthorized')
    }

    async refreshTokenUser(req: Request, res: Response){
        const valid = await jwtService.decodeToken(req.cookies.refreshToken)
        if(!valid) {
            res.status(401).send('Unauthorized')
            return
        }
            const user = await jwtService.getUserIdByToken(req.cookies.refreshToken)
            if(!user) {
                res.status(401).send('Unauthorized')
                return
            }
            await jwtService.createInvalidToken(req.cookies.refreshToken)
            const token = await jwtService.createJWT(user)
            res.cookie('refreshToken', token.refreshToken, {
                maxAge: 20 * 1000,
                httpOnly: true,
                secure: true
            });
            res.status(200).json({"accessToken": token.accessToken})
            return

    }

    async logoutUser(req: Request, res: Response){
        const valid = await jwtService.decodeToken(req.cookies.refreshToken)
        if(!valid) {
            res.status(401).send('Unauthorized')
            return
        }
        const result = await jwtService.createInvalidToken(req.cookies.refreshToken)
        if(result) {
            res.clearCookie('refreshToken');
            res.status(204).json(204)
            return
        }
        res.status(401).json(401)
    }

    async meUser(req: Request, res: Response){
        if(req.user!._id === "72f34508e52cffd123830723"){
            res.status(403).send('Forbidden')
            return
        }
        const user = await this.usersService.getMe(new ObjectId(req.user!._id))
        if(user){
            res.status(200).json(user)
            return
        }
        res.status(401).send('Unauthorized')
    }
}