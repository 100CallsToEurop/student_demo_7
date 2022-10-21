import "reflect-metadata"
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {PostsRepository} from "../repositories/posts-repository-db";
import {BloggersService} from "./bloggers.service";
import {PostDto} from "./dto/post.dto";
import {LikeDetails, PaginationPosts, PostQuery, PostViewModel} from "./types/post.type";
import {PostClass} from "./classes/post.service.class";
import {UsersService} from "./users.service";
import {LikeStatus} from "../repositories/interfaces/user.interface";
import {likeStatus} from "../domian/types/comment.type";
import {IPost} from "../repositories/interfaces/post.interface";


@injectable()
export class PostsService{

    constructor(
        private postsRepository: PostsRepository,
        private usersService: UsersService,
        private bloggersService: BloggersService
    ) {}

    async buildResponsePost(post: IPost, currentUser: ObjectId | null):Promise<PostViewModel>{
        let status = null
        if(currentUser) status = await this.usersService.getPostStatus(currentUser, post._id.toString())
        const lastThreeUsers = await this.postsRepository.getLastThreeUsers(post._id)
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            bloggerId: post.bloggerId,
            bloggerName: post.bloggerName,
            addedAt: post.addedAt.toDateString(),
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus:  status ? status : LikeStatus.NONE,
                newestLikes: lastThreeUsers ? lastThreeUsers : []
            }
        }
    }

    async createPost(createParam: PostDto):Promise<PostViewModel | null>  {

        const blogger = await this.bloggersService.getBloggerById(new ObjectId(createParam.bloggerId))
        if(!blogger) return null
        const newPost = new PostClass(createParam, blogger.name)
        await this.postsRepository.createPost(newPost)
        return await this.buildResponsePost(newPost, null)
    }

    async getPosts(currentUser: ObjectId, queryParams: PostQuery): Promise<PaginationPosts | null> {
        if(queryParams.id !== undefined) {
            const bloggers = await this.bloggersService.getBloggerById(new ObjectId(queryParams.id))
            if (!bloggers) return null
        }
        const items = await this.postsRepository.getPosts(queryParams)
        const totalCount = items.length
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const pagesCount = Math.ceil(totalCount/pageSize)
        const itemResult = await Promise.all(
            items.map(async(item): Promise<PostViewModel> => await this.buildResponsePost(item, currentUser))
        )
        return{
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: itemResult
        }
    }

    async getPostById(currentUserId: ObjectId , postId: ObjectId): Promise<PostViewModel | null> {
        const post = await this.postsRepository.getPostById(postId)
        if(!post) return null
        return await this.buildResponsePost(post, currentUserId)
    }
    async deletePostById(id: ObjectId): Promise<boolean> {
        return await this.postsRepository.deletePostById(id)
    }
    async updatePostById(id: ObjectId, updatePost: PostDto): Promise<boolean | null> {
        const blogger = await this.bloggersService.getBloggerById(new ObjectId(updatePost.bloggerId))
        if (blogger) return await this.postsRepository.updatePostById(id, updatePost)
        return null
    }

    async updateLikeForPost(currentUserId: ObjectId, postId: ObjectId, likeStatus: likeStatus){
        const user = await this.usersService.getUser(currentUserId)
        if(!user) return null
        const userInfo: LikeDetails = {
            addedAt: new Date(),
            userId: user.id,
            login: user.login
        }
        const comment = await this.postsRepository.getPostById(postId)
        if(!comment) return null
        const preStatus = await this.usersService.getPostStatus(currentUserId, postId.toString())
        //Есть like/dislike
        if(preStatus){
            if(likeStatus.likeStatus === LikeStatus.DISLIKE && preStatus === LikeStatus.LIKE){
                await this.postsRepository.dislikePost(postId)
                await this.postsRepository.unLikePost(postId)
                await this.usersService.eventLikePost(currentUserId, postId.toString(), likeStatus.likeStatus)
                await this.postsRepository.popTopUser(postId, user.id)
            }
            if(likeStatus.likeStatus === LikeStatus.LIKE && preStatus === LikeStatus.DISLIKE){
                await this.postsRepository.likePost(postId)
                await this.postsRepository.unDislikePost(postId)
                await this.usersService.setNoneStatusPost(currentUserId, postId.toString())
                await this.postsRepository.addLastLikeUser(postId, userInfo)
            }
            if(likeStatus.likeStatus === LikeStatus.NONE && preStatus === LikeStatus.LIKE){
                await this.postsRepository.unLikePost(postId)
                await this.usersService.setNoneStatusPost(currentUserId, postId.toString())
                await this.postsRepository.popTopUser(postId, user.id)

            }
            if(likeStatus.likeStatus === LikeStatus.NONE && preStatus === LikeStatus.DISLIKE){
                await this.postsRepository.unDislikePost(postId)
                await this.usersService.setNoneStatusPost(currentUserId, postId.toString())
                await this.postsRepository.popTopUser(postId, user.id)

            }
        }

        //Нет like/dislike
        if(!preStatus){

            if(likeStatus.likeStatus === LikeStatus.DISLIKE){
                await this.postsRepository.dislikePost(postId)
                await this.usersService.eventLikePost(currentUserId, postId.toString(), likeStatus.likeStatus)
                await this.postsRepository.popTopUser(postId, user.id)
            }
            if(likeStatus.likeStatus === LikeStatus.LIKE){
                await this.postsRepository.likePost(postId)
                await this.usersService.eventLikePost(currentUserId, postId.toString(), likeStatus.likeStatus)
                await this.postsRepository.addLastLikeUser(postId, userInfo)
            }
            if(likeStatus.likeStatus === LikeStatus.NONE){
            }
        }
        return true
    }


}