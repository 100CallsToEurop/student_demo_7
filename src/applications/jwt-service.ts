import jwt from 'jsonwebtoken'
import {UserViewModel} from "../domian/types/user.type";
import {usersRepository} from "../repositories/users.repository";


export const jwtService = {
    async createJWT(user: UserViewModel) {
        const accessToken = jwt.sign({userId: user.id}, `${process.env.SECRET_KEY}`, {expiresIn: '5m'})
        const refreshToken = jwt.sign({userId: user.id}, `${process.env.SECRET_KEY}`, {expiresIn: '10m'})
        return {
            accessToken,
            refreshToken
        }
    },
    async decodeToken(token: string){
        try{
            const result: any = jwt.verify(token, `${process.env.SECRET_KEY}`)
            return result
        }catch(err){
            return null
        }
    },
    async getUserIdByToken(token: string): Promise<UserViewModel | null> {
        const user = await usersRepository.findUserByRefreshToken(token)
        if(user){
            return {
                id: user._id.toString(),
                email: user.accountData.email,
                login: user.accountData.userName,
                createdAt: user.accountData.createAt.toString()
            }
        }
        return null
    },
    async createInvalidToken(token: string): Promise<boolean | null>{
        const user = await this.getUserIdByToken(token)
        if(user) {
            await usersRepository.addInBadToken(token)
            return true
        }
        return null
    }
}
