import userModel from '../../models/user.js';
import otpModel from '../../models/otp.js';
import constant from '../../utils/constant.js';
import { sendErrorResponse } from '../../utils/response.js';

export const verifyOTP = async (req, res) => {
    try {
        const body = req.body;
        const transaction = await otpModel.findOne({ txnId: body.txnId });

        if (!transaction) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.otp.validationError.transactionNotMatch);
        }

        if (transaction.expired) {
            return sendErrorResponse(res, constant.statusCode.expired, constant.otp.validationError.otpExpired);
        }

        const timeDifference = new Date() - new Date(transaction.updatedAt);
        
        if (timeDifference > transaction.expiryTime) {
            await markTransactionAsExpired(transaction);
            return sendErrorResponse(res, constant.statusCode.expired, constant.otp.validationError.otpHasBeenExpired);
        }
        
        if (body.otp !== transaction.otp) {
            return sendErrorResponse(res, constant.statusCode.required, constant.otp.validationError.emailOtpNotMatch);
        }

        const user = await userModel.findOne({ email: transaction.email }).select('email');
        if (!user) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.otp.validationError.userNotFound);
        }

        await verifyUser(user);
        await markTransactionAsExpired(transaction);

        return res.status(constant.statusCode.success).send({ status: true, message: constant.otp.otpVerified });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};

const markTransactionAsExpired = async (transaction) => {
    transaction.expired = true;
    await transaction.save();
};

const verifyUser = async (user) => {
    user.verified = true;
    await user.save();
};