import "reflect-metadata"

import {EmailTemplatesManager} from "../managers/registration-user";
import {v4 as uuidv4} from "uuid";

import {injectable} from "inversify";
import {ObjectId} from "mongodb";
import {UserServiceClass} from "./classes/user.service.class";
import add from "date-fns/add";

import bcrypt from "bcrypt";
import {UsersRepository} from "../repositories/users.repository";
import {UserViewModel} from "./types/user.type";
import {IUser} from "../repositories/interfaces/user.interface";
import {LoginInputModel} from "./types/login.type";
import {CreateUserDto} from "./dto/create-user.dto";

@injectable()
export class AuthService{
    constructor(
        private emailManager: EmailTemplatesManager,
        private usersRepository: UsersRepository
    ){}

    async createUser(userParam: CreateUserDto): Promise<UserViewModel | null>{
        const passwordHash = await this._generateHash(userParam.password)
        const newUser = new UserServiceClass(userParam, passwordHash, false)
        await this.usersRepository.createUser(newUser)
        try{
            await this.emailManager.sendEmailConfirmationMessage(newUser)
        }catch(err){
            console.log(err)
            //await usersRepository.deleteUserById(newUser._id)
            return null
        }
        return {
            id: newUser._id.toString(),
            email: newUser.accountData.email,
            login: newUser.accountData.userName,
            createdAt: newUser.accountData.createAt.toString()
        }
    }

    async findUserForConfirm(code: string){
        const user = await this.usersRepository.findByConfirmCode(code)
        if(!user) return false
        return await this.confirmEmail(user, code)
    }

    async confirmEmail(user:IUser, code: string){
        if(user.emailConfirmation.isConfirmed) return false
        if(user.emailConfirmation.confirmationCode !== code) return false
        if(user.emailConfirmation.expirationDate < new Date()) return false

        const result = await this.usersRepository.updateConfirmationState(user._id)
        return result
    }

    async findUserByEmail(email: string){
        const user = await this.usersRepository.finUserByEmail(email)
        if(!user) return false
        if(user.emailConfirmation.isConfirmed) return false
        const newCode = user.emailConfirmation.confirmationCode = uuidv4()
        await this.usersRepository.updateConfirmationCode(user._id, newCode)
        try{
            await this.emailManager.sendEmailConfirmationMessage(user)
        }catch(err){
            console.log(err)
            // await usersRepository.deleteUserById(user._id)
            return null
        }
        return {
            id: user._id.toString(),
            login: user.accountData.userName,
        }

    }

    async checkCredentials(loginParam: LoginInputModel): Promise<UserViewModel | null>{
        const user = await this.usersRepository.findUserByLogin(loginParam.login)
        if(!user) {
            return null
        }

        if(!user.emailConfirmation.isConfirmed){
            return null
        }

        const isHashedEquals = await this._isPasswordCorrect(loginParam.password, user.accountData.passwordHash)
        if(isHashedEquals) return {
            id: user._id.toString(),
            email: user.accountData.email,
            login: user.accountData.userName,
            createdAt: user.accountData.createAt.toString()
        }
        return null
    }

    async _generateHash(password: string){
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return hash
    }

    async _isPasswordCorrect(password: string, hash: string){
        const isEqual = await bcrypt.compare(password, hash)
        return isEqual
    }
}
