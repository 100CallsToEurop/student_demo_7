import "reflect-metadata"
import {EmailAdapter} from "../adapters/email-adapter";
import {IUser} from "../repositories/interfaces/user.interface";
import {injectable} from "inversify";

@injectable()
export class EmailTemplatesManager{

    constructor(private emailAdapter: EmailAdapter) {
    }

    async sendEmailConfirmationMessage(registrationParams: Omit<IUser, 'sessions' | 'likeEvent'>){
        const link = `To verify your email, go to <a href="https://somesite.com/confirm-email?code=${registrationParams.emailConfirmation.confirmationCode}">there</a>"`
        await this.emailAdapter.sendEmail(
            registrationParams.accountData.email,
            "Configuration of registration",
            `https://somesite.com/confirm-email?code=${registrationParams.emailConfirmation.confirmationCode}`,
            /*link*/)
    }
}
