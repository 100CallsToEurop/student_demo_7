import "reflect-metadata"
import {Router} from "express";
import {inputValidatorMiddleware} from "../middleware/input-validator-middleware";
import {authMiddleware} from "../middleware/auth-middleware";
import {nameValidation, titleValidation} from "../middleware/blogger-middleware";
import {contentValidation, shortDescriptionValidation, titleValidationPosts} from "../middleware/post-middleware";
import {container} from "../composition-root";
import {BloggerController} from "../controllers/blogger.controller";
import {checkCurrentUser} from "../middleware/check-current-user";

const bloggersController = container.resolve(BloggerController)

export const bloggersRouter = Router({})

bloggersRouter.get('/', bloggersController.getBloggers.bind(bloggersController))
bloggersRouter.get('/:id', bloggersController.getBlogger.bind(bloggersController))
bloggersRouter.delete('/:id', authMiddleware, bloggersController.deleteBlogger.bind(bloggersController))
bloggersRouter.post('/',
    authMiddleware,
    nameValidation,
    titleValidation,
    inputValidatorMiddleware,
    bloggersController.createBlogger.bind(bloggersController))
bloggersRouter.put('/:id',
    authMiddleware,
    nameValidation,
    titleValidation,
    inputValidatorMiddleware,
    bloggersController.updateBlogger.bind(bloggersController))

//for Posts
bloggersRouter.get('/:bloggerId/posts', checkCurrentUser, bloggersController.getBloggerPosts.bind(bloggersController))
bloggersRouter.post('/:bloggerId/posts',
    authMiddleware,
    titleValidationPosts,
    shortDescriptionValidation,
    contentValidation,
    inputValidatorMiddleware,
    bloggersController.createBloggerPost.bind(bloggersController)
    )