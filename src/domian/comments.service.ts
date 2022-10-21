import "reflect-metadata"
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {UsersService} from "./users.service";
import {CommentsRepository} from "../repositories/comments-repository-db";
import {PostsService} from "./posts.services";
import {CommentServiceClass} from "./classes/comments.service.class";
import {CommentInputModel, CommentQuery, CommentViewModel, likeStatus, PaginationComments} from "./types/comment.type";
import {CommentDto} from "./dto/comment.dto";
import {LikeStatus} from "../repositories/interfaces/user.interface";
import {IComment} from "../repositories/interfaces/comment.interface";


@injectable()
export class CommentService{
    constructor(
        private commentsRepository: CommentsRepository,
        private postsService: PostsService,
        private usersService: UsersService
    ) {}

    async buildResponseComment(comment: IComment, currentUser: ObjectId | null):Promise<CommentViewModel>{
        let status = null
        if(currentUser)
        status = await this.usersService.getCommentStatus(currentUser, comment._id.toString())
        return {
            id: comment._id.toString(),
            content: comment.content,
            userId: comment.userId,
            userLogin: comment.userLogin,
            addedAt: comment.addedAt.toDateString(),
            likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: status ? status : LikeStatus.NONE
            },
        }
    }

    async createComment(
        currentUserId: ObjectId,
        postId: ObjectId,
        createParam: CommentDto
    ):Promise<CommentViewModel | null> {
        const user = await this.usersService.getUser(currentUserId)
        const posts = await this.postsService.getPostById(currentUserId, postId)
        if (!posts) return null
        const newComment = new CommentServiceClass(
            currentUserId.toString(),
            createParam.content,
            user!.login,
            postId.toString(),
        )
        await this.commentsRepository.createComments(newComment)
        return await this.buildResponseComment(newComment, null)

    }

    async getComments(currentUserId: ObjectId, queryParams: CommentQuery): Promise<PaginationComments | null>{
        if(queryParams.postId !== undefined) {
            const posts = await this.postsService.getPostById(currentUserId, new ObjectId(queryParams.postId))
            if (!posts) return null
        }
        const items = await this.commentsRepository.getComments(queryParams)
        const totalCount = items.length
        const page = Number(queryParams.PageNumber) || 1
        const pageSize = Number(queryParams.PageSize) || 10
        const pagesCount = Math.ceil(totalCount/pageSize)
        const itemResult = await Promise.all(
            items.map(async(item): Promise<CommentViewModel> =>await this.buildResponseComment(item, currentUserId))
        )
        return{
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: itemResult
        }
    }

    async updateCommentById(id: ObjectId, updateComment: CommentDto): Promise<boolean>{
        return await this.commentsRepository.updateCommentById(id, updateComment)
    }
    async getCommentById(currentUserId: ObjectId ,commentId: ObjectId): Promise<CommentViewModel | null> {
        const comment = await this.commentsRepository.getCommentById(commentId)
        if(!comment) return null
       return await this.buildResponseComment(comment, currentUserId)
    }
    async deleteCommentById(id: ObjectId){
        return await this.commentsRepository.deleteCommentById(id)
    }

    async checkCommentById(currentUserId: ObjectId, id: ObjectId){
        const comment = await this.commentsRepository.getCommentById(id)
        if(!comment) return null
        const userCheck = await this.usersService.getUser(new ObjectId(comment.userId))
        if(currentUserId.toString() === userCheck!.id) return true
        return false
    }

    async updateLikeForComment(currentUserId: ObjectId, commentId: ObjectId, likeStatus: likeStatus){
        const comment = await this.commentsRepository.getCommentById(commentId)
        if(!comment) return null
        const preStatus = await this.usersService.getCommentStatus(currentUserId, commentId.toString())
console.log(preStatus)
        //Есть like/dislike
        if(preStatus){
            if(likeStatus.likeStatus === LikeStatus.DISLIKE && preStatus === LikeStatus.LIKE){
                await this.commentsRepository.dislikeComment(commentId)
                await this.commentsRepository.unLikeComment(commentId)
                await this.usersService.eventLikeComment(currentUserId, commentId.toString(), likeStatus.likeStatus)
            }
            if(likeStatus.likeStatus === LikeStatus.LIKE && preStatus === LikeStatus.DISLIKE){
                await this.commentsRepository.likeComment(commentId)
                await this.commentsRepository.unDislikeComment(commentId)
                await this.usersService.eventLikeComment(currentUserId, commentId.toString(), likeStatus.likeStatus)
            }
            if(likeStatus.likeStatus === LikeStatus.NONE && preStatus === LikeStatus.LIKE){
                console.log(1)
                await this.commentsRepository.unLikeComment(commentId)
                await this.usersService.setNoneStatusComment(currentUserId, commentId.toString())
            }
            if(likeStatus.likeStatus === LikeStatus.NONE && preStatus === LikeStatus.DISLIKE){
                await this.commentsRepository.unDislikeComment(commentId)
                await this.usersService.setNoneStatusComment(currentUserId, commentId.toString())
            }
        }

        //Нет like/dislike
        if(!preStatus){
            if(likeStatus.likeStatus === LikeStatus.DISLIKE){
                await this.commentsRepository.dislikeComment(commentId)
                await this.usersService.eventLikeComment(currentUserId, commentId.toString(), likeStatus.likeStatus)
            }
            if(likeStatus.likeStatus === LikeStatus.LIKE){
                await this.commentsRepository.likeComment(commentId)
                await this.usersService.eventLikeComment(currentUserId, commentId.toString(), likeStatus.likeStatus)
            }
            if(likeStatus.likeStatus === LikeStatus.NONE){}
        }
        return true
    }
}
