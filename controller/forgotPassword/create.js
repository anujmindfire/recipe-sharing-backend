import userModel from '../../models/user.js';
import forgotPassword from '../../models/forgotPassword.js';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../../services/sendEmail.js';
import constant from '../../utils/constant.js';
import fs from 'fs';
import path from 'path';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export const sendEmailForForgotPassword = async (req, res) => {
    try {
        const body = req.body;
        const uuidWithoutHyphens = uuidv4().replace(/-/g, '');

        if (!body.email) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.forgotPassword.validationError.emailRequired });
        }

        const userData = await userModel.findOne({ email: body.email });
        if (!userData || (userData && !userData.verified)) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.forgotPassword.validationError.emailNotExist });
        }

        const currentDate = new Date();
        const existingEntry = await forgotPassword.findOne({ email: body.email });

        if (existingEntry) {
            const startOfDay = new Date(currentDate.getTime() - (currentDate.getTime() % DAY_IN_MILLISECONDS));
            const emailCountToday = existingEntry.createdAt >= startOfDay;
            const canSendEmail = !existingEntry.lastEmailSent || (currentDate - existingEntry.lastEmailSent >= TEN_MINUTES);
            const hasExceededEmailCount = existingEntry.emailCount >= 3;

            if (hasExceededEmailCount) {
                return res.status(constant.statusCode.tooManyRequests).send({ status: false, message: constant.forgotPassword.validationError.reachLimit });
            }

            if (emailCountToday && existingEntry.requestCount >= 2) {
                return res.status(constant.statusCode.tooManyRequests).send({ status: false, message: constant.forgotPassword.validationError.dayLimit });
            }

            if (!canSendEmail) {
                return res.status(constant.statusCode.tooManyRequests).send({ status: false, message: constant.forgotPassword.validationError.waitTime });
            }

            existingEntry.txnId = uuidWithoutHyphens;
            existingEntry.requestCount = emailCountToday ? existingEntry.requestCount + 1 : 1;
            existingEntry.emailCount += 1;
            existingEntry.lastEmailSent = currentDate;
            existingEntry.expired = false;
            await existingEntry.save();
        } else {
            await forgotPassword.create({
                txnId: uuidWithoutHyphens,
                email: body.email,
                userId: userData.id,
                expiryTime: 1800000,
                requestCount: 1,
                emailCount: 1,
                lastEmailSent: currentDate,
            });
        }

        const encodedEmail = Buffer.from(body.email).toString('base64');
        const templatePath = path.join(process.cwd(), 'public/forgotPassword.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        const currentYear = new Date().getFullYear();

        const txnId = existingEntry ? existingEntry.txnId : uuidWithoutHyphens;
        htmlTemplate = htmlTemplate
            .replace('{{name}}', userData.name)
            .replace('{{year}}', currentYear)
            .replace('{{resetLink}}', `${process.env.FRONTEND}/forgot-password/${txnId}?data=${encodedEmail}`);

        const mailOptions = {
            from: process.env.FROM,
            to: body.email,
            subject: constant.otp.forgotPassword,
            html: htmlTemplate,
        };

        const result = await sendEmail(mailOptions);
        if (result.messageId && result.accepted.length > 0) {
            return res.status(constant.statusCode.success).send({ status: true, message: constant.forgotPassword.emailSuccess, data: { txnId: uuidWithoutHyphens } });
        }

        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.forgotPassword.validationError.errorSendEmail });
        
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};
