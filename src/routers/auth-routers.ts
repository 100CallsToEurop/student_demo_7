import "reflect-metadata"
import {Router} from "express";
import {
    confirmValidation,
    emailValidationRegistration, emailValidationResending,
    loginValidation,
    passwordValidation
} from "../middleware/registration-middleware";

import {checkLimitReq} from "../middleware/checkLimitRequest-middleware";
import {inputValidatorMiddleware} from "../middleware/input-validator-middleware";
import {container} from "../composition-root";
import {AuthController} from "../controllers/auth.controller";
import {authMiddlewareJWT} from "../middleware/auth-middleware-jwt";



const authController = container.resolve(AuthController)

export const authRouter = Router({})

authRouter.post('/registration',
    checkLimitReq,
    loginValidation,
    emailValidationRegistration,
    passwordValidation,
    inputValidatorMiddleware,
    authController.registrationUsers.bind(authController))

authRouter.post('/registration-email-resending',
    checkLimitReq,
    emailValidationResending,
    inputValidatorMiddleware,
    authController.registrationEmailResendingUser.bind(authController))

authRouter.post('/login',
    checkLimitReq,
    authController.loginUser.bind(authController))

authRouter.post('/registration-confirmation', checkLimitReq,
    confirmValidation,
    inputValidatorMiddleware,
    authController.registrationConfirmationUser.bind(authController))

authRouter.post('/refresh-token',
    authController.refreshTokenUser.bind(authController))

authRouter.post('/logout',
    authController.logoutUser.bind(authController))

authRouter.get('/me',
    authMiddlewareJWT,
    inputValidatorMiddleware,
    authController.meUser.bind(authController))




