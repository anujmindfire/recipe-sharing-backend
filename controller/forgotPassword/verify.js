import userModel from '../../models/user.js';
import forgotPasswordModel from '../../models/forgotPassword.js';
import { checkRequiredFields, hashPassword } from '../../validation/validation.js';
import constant from '../../utils/constant.js';
import { sendErrorResponse } from '../../utils/response.js';

export const passwordVerify = async (req, res) => {
    try {

        const body = req.body

        let transaction = await forgotPasswordModel.findOne({ txnId: body.txnId });

        if (!transaction) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.otp.validationError.invalidTransationId);
        }

        if (transaction.expired) {
            return sendErrorResponse(res, constant.statusCode.expired, constant.forgotPassword.validationError.linkExpired);
        }

        const requiredFields = checkRequiredFields(['password', 'confirmPassword'], body);
        if (requiredFields !== true) {
            return sendErrorResponse(res, constant.statusCode.required, constant.general.requiredField(requiredFields));
        }

        if (body.confirmPassword !== body.password) {
            return sendErrorResponse(res, constant.statusCode.required, constant.forgotPassword.validationError.passwordNotMatch);
        }

        const timeDifference = new Date() - new Date(transaction.updatedAt);

        if (timeDifference > transaction.expiryTime) {
            transaction.expired = true;
            await transaction.save();
            return sendErrorResponse(res, constant.statusCode.expired, constant.forgotPassword.validationError.linkExpired);
        } else {
            let user = await userModel.findById(transaction.userId);
            if (!user) {
                return sendErrorResponse(res, constant.statusCode.notFound, constant.otp.validationError.userNotFound);
            }
            user.password = await hashPassword(body.confirmPassword);
            transaction.expired = true;
            await user.save();
            await transaction.save();
            return res.status(constant.statusCode.success).send({ status: true, message: constant.forgotPassword.passwordChange })
        }
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};