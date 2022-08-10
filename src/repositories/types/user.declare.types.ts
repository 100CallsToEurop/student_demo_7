import {IUser} from "../interfaces/user.interface";

export type Guest = {
    _id: string
}

declare global {
    namespace Express {
         interface Request {
            user: IUser | Guest | null
        }
    }
}
