import "reflect-metadata"
import {Router} from "express";
import {authMiddleware} from "../middleware/auth-middleware";
import {inputValidatorMiddleware} from "../middleware/input-validator-middleware";
import {loginValidation, passwordValidation} from "../middleware/registration-middleware";
import {container} from "../composition-root";
import {UsersController} from "../controllers/user.controller";


const usersController = container.resolve(UsersController)

export const usersRouter = Router({})

usersRouter.get('/', usersController.getUsers.bind(usersController))
usersRouter.post('/',
    authMiddleware,
    loginValidation,
    passwordValidation,
    inputValidatorMiddleware,
    usersController.createUsers.bind(usersController)
    )
usersRouter.delete('/:id', authMiddleware, usersController.deleteUser.bind(usersController))
usersRouter.get('/:id/com', usersController.getCommentStatus.bind(usersController))

usersRouter.delete('/:id/com', usersController.setNoneStatusComment.bind(usersController))
usersRouter.post('/:id/com', usersController.eventLikeComment.bind(usersController))

