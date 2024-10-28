import userModel from '../../models/user.js';
import otpModel from '../../models/otp.js';
import { generateOTP, sendOTPByEmail } from '../../common/commonFunctions.js';
import { processBlockedUser, handleOTPLimit } from './create.js';
import { sendErrorResponse } from '../../utils/response.js';
import constant from '../../utils/constant.js';

export const resendOTP = async (req, res) => {
    try {
        const body = req.body;
        let otpCode = generateOTP();
        
        const transaction = await otpModel.findOne({ txnId: body.txnId });
        
        if (!transaction) {
            return sendErrorResponse(res, constant.statusCode.required, constant.otp.validationError.invalidTransationId);
        }

        const user = await userModel.findOne({ email: transaction.email }).select(['email', 'name']);

        if (!user) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.otp.validationError.userNotFound);
        }

        if (transaction.limit === constant.otp.maxLimit && transaction.blockedUntil !== null) {            
            const result = await processBlockedUser(req, res, otpCode, transaction);
            if ([constant.otp.validationError.tryAgain].includes(result)) {
                return sendErrorResponse(res, constant.statusCode.serviceUnavailable, result);
            }
            transaction.txnId = result.txnId; 
            otpCode = result.otp;
        }

        if (transaction && transaction.blockedUntil === null) {
            const result = await handleOTPLimit(req, res, otpCode, transaction);
            if ([constant.otp.validationError.reachLimit].includes(result)) {
                return sendErrorResponse(res, constant.statusCode.tooManyRequests, result);
            }

            transaction.txnId = result.txnId; 
            otpCode = result.otp;
        }

        const emailResult = await sendOTPByEmail(user.email, user.name, otpCode);
        if (emailResult === constant.forgotPassword.validationError.invalidCred) {
            return sendErrorResponse(res, constant.statusCode.required, constant.forgotPassword.validationError.errorSendEmail);
        }
        return res.status(constant.statusCode.success).send({ status: true, message: constant.otp.otpSuccess, data: { txnId: transaction.txnId } });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};