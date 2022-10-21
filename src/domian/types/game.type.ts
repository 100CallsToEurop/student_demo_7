import {Pagination} from "../../repositories/types/pagination.types";
import {UserViewModel} from "./user.type";
import {AnswerViewModel, QuestionViewModel} from "./question.type";



export enum GameStatuses {
    PENDING = 'PendingSecondPlayer',
    ACTIVE = 'Active',
    FINISH = 'Finished',
}

export type GamePlayerProgressViewModel = {
    answers: Array<AnswerViewModel>,
    user: UserViewModel,
    score: number
}


export type GamePairViewModel = {
    id: string,
    firstPlayer: GamePlayerProgressViewModel,
    secondPlayer: GamePlayerProgressViewModel,
    questions: Array<QuestionViewModel>,
    status: GameStatuses,
    pairCreatedDate: string,
    startGameDate: string | null,
    finishGameDate: string | null
}

export type GamePairViewModelPagination = Pagination & {
    items: Array<GamePairViewModel>
}


