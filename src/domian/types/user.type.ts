import {Pagination} from "../../repositories/types/pagination.types";

export type UserViewModel = {
    id:	string,
    login: string
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