import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

export enum EmailType {
    OTP = 'OTP',
    FORGOTPASSWORD = 'FORGOTPASSWORD'
}

const emailTemplates = {
    [EmailType.OTP]: (data: { otp: string }) => ({
        subject: "Your OTP Code",
        text: `TechWord\n\nYour OTP code is ${data.otp}. It is valid for 1 minute.`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <h2 style="color: #333; margin-bottom: 12px;">TechWord</h2>
        <p>Your OTP code is <h3><strong>${data.otp}</strong></h3>. It is valid for 1 minute.</p>
      </div>
    `,
    }),


    [EmailType.FORGOTPASSWORD]: (data: { resetLink: string }) => ({
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link below to reset your password: ${data.resetLink}. If you did not request this, please ignore this email.`,
        html: `<p>You requested a password reset.</p>
               <p>Click the link below to reset your password:</p>
               <a href="${data.resetLink}" target="_blank">Reset Password</a>
               <p>If you did not request this, please ignore this email.</p>`,
    })
}


export const sendEmail = async (to: string, type: EmailType, data: any) => {
    try {
        const template = emailTemplates[type](data);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: template.subject,
            text: template.text,
            html: template.html,
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ', info.response);
        return info;
    } catch (error: any) {
        console.error('Error sending email: ', error);
        throw error;
    }
}