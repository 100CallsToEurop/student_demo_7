import "reflect-metadata"
import {UsersRepository} from "../repositories/users.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {GameParam, PaginationTopUsers, PaginationUsers, TopGamePlayerViewModel, UserViewModel} from "./types/user.type";
import bcrypt from 'bcrypt'
import {UserServiceClass} from "./classes/user.service.class";
import {ObjectId} from "mongodb";
import {Query} from "../repositories/types/query.type";
import {IUser, LikeStatus} from "../repositories/interfaces/user.interface";
import {injectable} from "inversify";

@injectable()
export class UsersService {
    constructor(
        private usersRepository: UsersRepository
    ){}

    buildResponseUser(user: IUser): UserViewModel{
        return {
            id: user._id.toString(),
            email: user.accountData.email,
            login: user.accountData.userName,
            createdAt: user.accountData.createAt.toString()
        }
    }

    async createUser(createParam: CreateUserDto): Promise<UserViewModel | null>{
        const passwordHash = await this._generateHash(createParam.password)
        const newUser = new UserServiceClass(createParam, passwordHash, true)
        await this.usersRepository.createUser(newUser)
        return this.buildResponseUser(newUser)
    }

    async getUsers(queryParams: Query): Promise<PaginationUsers>{
        const items = await this.usersRepository.getUsers(queryParams)
        const totalCount = items.length
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const pagesCount = Math.ceil(totalCount/pageSize)
        return{
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map(item =>this.buildResponseUser(item))
        }

    }

    async getUser(id: ObjectId): Promise<UserViewModel | null>{
        const user = await this.usersRepository.findUserById(id)
        if(!user) return null
        return this.buildResponseUser(user)
    }

    async deleteUser(id: ObjectId){
        return await this.usersRepository.deleteUserById(id)
    }

    async getMe(id: ObjectId){
        const user = await this.usersRepository.findUserById(id)
        if(user) {
            return {
                userId: user._id.toString(),
                email: user.accountData.email,
                login: user.accountData.userName
            }
        }
        return null
    }

    async getCommentStatus(id: ObjectId, commentId: string): Promise< LikeStatus | null>{
        const status = await this.usersRepository.getMeStatusComments(id, commentId)
        if(!status) return null
        return status.myStatus
    }

    async eventLikeComment(id: ObjectId, commentId: string, status: string): Promise<boolean | null>{
        const success = await this.usersRepository.eventLikeComments(id, commentId, status)
        if(!success) return null
        return true
    }

    async setNoneStatusComment(id: ObjectId, commentId: string): Promise<boolean | null>{
        const success = await this.usersRepository.eventNoneComments(id, commentId)
        if(!success) return null
        return true
    }

    async getPostStatus(id: ObjectId, postId: string): Promise< LikeStatus | null>{
        const status = await this.usersRepository.getMeStatusPosts(id, postId)
        if(!status) return null
        return status.myStatus
    }

    async eventLikePost(id: ObjectId, postId: string, status: string): Promise<boolean | null>{
        const user = await this.usersRepository.findUserById(id)
        if(!user) return null
        const success = await this.usersRepository.eventLikePosts(id, postId, status)
        if(!success) return null
        return true
    }

    async setNoneStatusPost(id: ObjectId, postId: string): Promise<boolean | null>{
        const success = await this.usersRepository.eventNonePosts(id, postId)
        if(!success) return null
        return true
    }

    //game
    async addFinishGame(id: ObjectId, gameParam: GameParam): Promise<boolean | null>{
        const user = await this.usersRepository.findUserById(id)
        if(!user) return null
        user.gameStatistic.gamePlayedId.push(gameParam.gameId)
        user.gameStatistic.sumScore += gameParam.sumScore
        user.gameStatistic.gamesCount = user.gameStatistic.gamePlayedId.length
        user.gameStatistic.avgScores = user.gameStatistic.sumScore / user.gameStatistic.gamesCount
        user.gameStatistic.winsCount += gameParam.winsCount
        user.gameStatistic.lossesCount += gameParam.lossesCount
        const success = await this.usersRepository.addFinishGame(id, user)
        if(!success) return null
        return true
    }

    async  getGameUsers(queryParams: Query): Promise <PaginationTopUsers>{
        const items = await this.usersRepository.getGameUsers(queryParams)
        const totalCount = items.length
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const pagesCount = Math.ceil(totalCount/pageSize)
        return {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map(item =>{
                return{
                    user: {
                        id: item._id.toString(),
                        email: item.accountData.email,
                        login: item.accountData.userName,
                        createdAt: item.accountData.createAt.toString()
                    },
                    sumScore: item.gameStatistic.sumScore,
                    avgScores: item.gameStatistic.avgScores,
                    gamesCount: item.gameStatistic.gamesCount,
                    winsCount: item.gameStatistic.winsCount,
                    lossesCount: item.gameStatistic.lossesCount
                }
            })
        }
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