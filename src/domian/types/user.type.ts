import {Pagination} from "../../repositories/types/pagination.types";

export type UserViewModel = {
    id:	string,
    email: string,
    login: string,
    createdAt: string
}

export type UserInputModel = {
    login: string
    email: string
    password: string
}

export type PaginationUsers =
    Pagination & {
    items?: Array<UserViewModel>
}

export type GameParam = Omit<TopGamePlayerViewModel, 'user' | 'avgScores' | 'gamesCount'> & {
    gameId: string
}

export type TopGamePlayerViewModel = {
    user: UserViewModel
    sumScore: number,
    avgScores: number,
    gamesCount: number,
    winsCount: number,
    lossesCount: number
}

export type PaginationTopUsers =
    Pagination & {
    items: Array<TopGamePlayerViewModel>
}