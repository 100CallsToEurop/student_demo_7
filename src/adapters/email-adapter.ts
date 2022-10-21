import "reflect-metadata"
import nodemailer from "nodemailer";
import {injectable} from "inversify";
@injectable()
export class EmailAdapter{
    async sendEmail(email: string, subject: string, text: string, html?: string){
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "100callstoeurop",
                pass: "xhjlvrdmplxzkndo",
            }
        })
        let info = await transporter.sendMail({
            from: 'Vladimir <petiryakov@teh.expert>',
            to: email,
            subject,
            text,
            //html: html
        })
    }
}

export const emailAdapter = new EmailAdapter()