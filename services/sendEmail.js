import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import constant from '../utils/constant.js';

dotenv.config();

export const sendEmail = async (mailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.EMAILPORT,
            secure: false,
            auth: {
                user: process.env.NAME,
                pass: process.env.PASSWORD,
            },
        });

        const emailInfo = await transporter.sendMail(mailOptions);
        return emailInfo;
    } catch (error) {
        if (error.response) {
            if (error.response.includes(constant.forgotPassword.validationError.authFailed)) {
                return constant.forgotPassword.validationError.invalidCred;
            }
        } else {
            throw new Error(`Error sending OTP: ${error.response ? error.response.data : error.message}`);
        }
    }
};