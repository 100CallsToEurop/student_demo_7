import nodemailer from "nodemailer";

export const emailAdapter = {
    async sendEmail(email: string, subject: string, text: string, html?: string){
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "100callstoeurop",
                pass: "xhjlvrdmplxzkndo",
            }
        })
        console.log(html)
        let info = await transporter.sendMail({
            from: 'Vladimir <petiryakov@teh.expert>',
            to: email,
            subject,
            text,
            //html: html
        })
    }
}