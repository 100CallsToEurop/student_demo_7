import "reflect-metadata"
import {ObjectId} from "mongodb";
import {ILikes, IUser, LikeStatus} from "./interfaces/user.interface";
import {UserModel} from "./modeles/user.model";
import {Query} from "./types/query.type";
import {injectable} from "inversify";
import {GameParam, TopGamePlayerViewModel} from "../domian/types/user.type";

@injectable()
export class UsersRepository{
    //Основные операции с юзером
    async getUsers(queryParams: Query): Promise<IUser[]>{
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return UserModel.find().skip(skip).limit(pageSize).lean()
    }

    async findUserById(_id: ObjectId): Promise<IUser | null> {
        return UserModel.findOne({_id})
    }

    async deleteUserById(_id: ObjectId): Promise<boolean>{
        const user = await UserModel.findOne({_id})
        if(!user) return false
        await user.delete({_id})
        return true
    }

    async updateUser(_id: ObjectId, updateParam: IUser): Promise<IUser | null>{
        const user = await UserModel.findOne({_id})
        if(!user) return null
        user.updateOne({}, updateParam)
        await user.save()
        return updateParam
    }

    async createUser(createParam: Omit<IUser, 'sessions' | 'likeEvent'>): Promise<void>{
       const user = new UserModel(createParam)
       await user.save()
    }


    //Операции с логином/email
    async findUserByLogin(login: string): Promise<IUser | null>{
        return UserModel.findOne().where({"accountData.userName": login})
    }

    async finUserByEmail(email: string): Promise<IUser | null>{
        return UserModel.findOne().where({"accountData.email": email})
    }

    async checkUserEmailOrLogin(LoginOrEmail: string): Promise<IUser | null>{
        return UserModel.findOne().where({
            $or:
                [
                    {"accountData.userName": LoginOrEmail},
                    {"accountData.email": LoginOrEmail}
                ]
        })
    }

    //Операции подтверждения
    async findByConfirmCode(code: string): Promise<IUser | null>{
        return UserModel.findOne().where({"emailConfirmation.confirmationCode": code})
    }

    async updateConfirmationState(_id: ObjectId): Promise<boolean>{
        const userInstance = await UserModel.findOne({_id})
        if(!userInstance) return false
        userInstance.emailConfirmation.isConfirmed = true,
            await userInstance.save()
        return true
    }

    async updateConfirmationCode(_id: ObjectId, code: string): Promise<boolean>{
        const userInstance = await UserModel.findOne({_id})
        if(!userInstance) return false
        userInstance.emailConfirmation.confirmationCode = code,
            await userInstance.save()
        return true
    }

    //Операция с токеном
    async updateRefreshToken(_id: ObjectId, token: string | null): Promise<boolean | null>{
        const userInstance = await UserModel.findOne({_id})
        if(userInstance){
            userInstance.sessions.refreshToken = token,
                await userInstance.save()
            return true
        }
        return false
    }

    async addInBadToken(token: string): Promise<void>{
        const userInstance = await UserModel.findOne({"sessions.refreshToken": token})
        if(userInstance){
            userInstance.sessions.badTokens.push(userInstance.sessions.refreshToken!)
            userInstance.sessions.refreshToken = null
            await userInstance.save()

        }
    }

    async findUserByRefreshToken(token: string):Promise<IUser | null>{
        return UserModel.findOne({"sessions.refreshToken": token})
    }

    async findBadToken(token: string){
        const result =  await UserModel.findOne().where({"userInstance.sessions.badTokens":{$in: token}})
        if(result) return result
        return false
    }

    //Операции с лайками
    async getMeStatusComments(_id: ObjectId, commentId: string, ): Promise<ILikes | null>{
        const user = await UserModel.findOne({_id})
        if(!user) return null
        const status = user.likeEvent.commentsLikes.find(el => {
            if(el.id === commentId) return el
        })
        if(!status) return null
        return {
            id: status.id,
            myStatus: status.myStatus
        }
    }

    async eventLikeComments(_id: ObjectId, commentId: string, status: string): Promise<boolean>{
        const user = await UserModel.findOne({_id})
        if(user){
            if(!await this.getMeStatusComments(_id, commentId)) {
                user.likeEvent.commentsLikes.push({
                    id: commentId,
                    myStatus: status as LikeStatus
                })
                await user.save()
                return true
            }
            else{
                user.likeEvent.commentsLikes = user.likeEvent.commentsLikes.map(el=>{
                    if(el.id === commentId) el.myStatus = status as LikeStatus
                    return el
                })
                user.markModified('likeEvent')
                await user.save()
                return true
            }
        }
        return false
    }

    async eventNoneComments(_id: ObjectId, commentId: string){
        const user = await UserModel.findOne({_id})
        if(!user) return null
        user.likeEvent.commentsLikes = user.likeEvent.commentsLikes.filter(el =>{
            return el.id !== commentId
        })
        user.markModified('likeEvent')
        await user.save()
        return true
    }

    async getMeStatusPosts(_id: ObjectId, postId: string): Promise< ILikes | null>{
        const user = await UserModel.findOne({_id})
        if(!user) return null
        const status = user.likeEvent.postsLikes.find(el=>{
            if(el.id === postId) return el
        })
        if(!status) return null
        return {
            id: status.id,
            myStatus: status.myStatus
        }
    }

    async eventLikePosts(_id: ObjectId, postId: string, status: string){
        const user = await UserModel.findOne({_id})
        if(user){
            if(!await this.getMeStatusPosts(_id, postId)) {
                user.likeEvent.postsLikes.push({
                    id: postId,
                    myStatus: status as LikeStatus
                })
                await user.save()
                return true
            }
            else{
                user.likeEvent.postsLikes = user.likeEvent.postsLikes.map(el=>{
                    if(el.id === postId) el.myStatus = status as LikeStatus
                    return el
                })
                user.markModified('likeEvent')
                await user.save()
                return true
            }
        }
        return false
    }

    async eventNonePosts(_id: ObjectId, postId: string){
        const user = await UserModel.findOne({_id})
        if(!user) return null
        user.likeEvent.postsLikes = user.likeEvent.postsLikes.filter(el =>{
            return el.id !== postId
        })
        user.markModified('likeEvent')
        await user.save()
        return true
    }

    //game
    async addFinishGame(_id: ObjectId, updateParam: IUser) {
        return UserModel.findOneAndUpdate({_id}, updateParam, {
            returnOriginal: false
        })
    }


    async getGameUsers(queryParams: Query): Promise<IUser[]>{
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const skip: number = (page-1) * pageSize
        return UserModel.find().skip(skip).limit(pageSize).sort({"user.gameStatistic.sumScore": 1}).lean()
    }
}

export const usersRepository = new UsersRepository()