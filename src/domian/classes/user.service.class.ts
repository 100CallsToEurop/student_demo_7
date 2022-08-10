import {ObjectId} from "mongodb";

export class UserServiceClass {
    constructor(
        public _id: ObjectId,
        public accountData:{
            userName: string,
            email: string,
            passwordHash: string,
            createAt: Date
        },
        public emailConfirmation:{
            confirmationCode: string,
            expirationDate: Date,
            isConfirmed: boolean,
        }
    ) {
    }

}