import {Router} from "express";
import {container} from "../composition-root";
import {GameController} from "../controllers/game.controller";
import {authMiddleware} from "../middleware/auth-middleware";
import {inputValidatorMiddleware} from "../middleware/input-validator-middleware";

const gameController = container.resolve(GameController)

export const gameRouter = Router({})

gameRouter.get('/pairs/my-current',
    authMiddleware,
    inputValidatorMiddleware,
    gameController.getCurrentGame.bind(gameController))
gameRouter.get('/pairs/:id',
    authMiddleware,
    inputValidatorMiddleware,
    gameController.getGameById.bind(gameController))
gameRouter.get('/pairs/my',
    authMiddleware,
    inputValidatorMiddleware,
    gameController.getStaticGames.bind(gameController))
gameRouter.post('/pairs/connection',
    authMiddleware,
    inputValidatorMiddleware,
    gameController.connectionGame.bind(gameController))
gameRouter.post('/pairs/my-current/answers',
    authMiddleware,
    inputValidatorMiddleware,
    gameController.sendAnswers.bind(gameController))
gameRouter.get('/users/top',
    gameController.getTopUsers.bind(gameController))