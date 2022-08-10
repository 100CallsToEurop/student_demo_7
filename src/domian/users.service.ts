import "reflect-metadata"
import {UsersRepository} from "../repositories/users.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {PaginationUsers, UserViewModel} from "./types/user.type";
import bcrypt from 'bcrypt'
import {v4 as uuidv4} from "uuid";
import add from 'date-fns/add'
import {UserServiceClass} from "./classes/user.service.class";
import {ObjectId} from "mongodb";
import {Query} from "../repositories/types/query.type";
import {LikeStatus} from "../repositories/interfaces/user.interface";
import {injectable} from "inversify";
import {PostsService} from "./posts.services";

@injectable()
export class UsersService {
    constructor(
        private usersRepository: UsersRepository
    ){}

    async createUser(createParam: CreateUserDto): Promise<UserViewModel | null>{
        const passwordHash = await this._generateHash(createParam.password)
        const newUser = new UserServiceClass(
            new ObjectId(),
            {
                userName: createParam.login,
                email: createParam.email,
                passwordHash,
                createAt: new Date()
            },
            {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 3
                }),
                isConfirmed: true
            }
        )
        await this.usersRepository.createUser(newUser)
        return {
            id: newUser._id.toString(),
            login: newUser.accountData.userName,
        }
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
            items: items.map(item =>{
                return{
                    id: item._id.toString(),
                    login: item.accountData.userName
                }
            })
        }

    }

    async getUser(id: ObjectId): Promise<UserViewModel | null>{
        const user = await this.usersRepository.findUserById(id)
        if(!user) return null
        return {
            id: user._id.toString(),
            login: user.accountData.userName,
        }
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