import "reflect-metadata"
import {Router} from "express";
import {commentValidation, statusForLike} from "../middleware/comment-middleware";
import {inputValidatorMiddleware} from "../middleware/input-validator-middleware";
import {authMiddlewareJWT} from "../middleware/auth-middleware-jwt";
import {container} from "../composition-root";
import {CommentController} from "../controllers/comment.controller";
import {checkCurrentUser} from "../middleware/check-current-user";
import {inputValidatorPostMiddleware} from "../middleware/input-validator-post-middleware";


const commentController = container.resolve(CommentController)

export const commentsRouter = Router({})

commentsRouter.get('/:id', checkCurrentUser, commentController.getComment.bind(commentController))
commentsRouter.put('/:commentId',
    authMiddlewareJWT,
    commentValidation,
    inputValidatorMiddleware,
    commentController.updateComment.bind(commentController))
commentsRouter.delete('/:commentId',
    authMiddlewareJWT,
    commentController.deleteComment.bind(commentController))

//for like
commentsRouter.put('/:commentId/like-status',
    authMiddlewareJWT,
    statusForLike,
    inputValidatorMiddleware,
    inputValidatorPostMiddleware,
    commentController.updateCommentLike.bind(commentController))

