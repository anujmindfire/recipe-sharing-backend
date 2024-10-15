import userModel from '../../models/user.js';
import forgotPasswordModel from '../../models/forgotPassword.js';
import { checkRequiredFields, hashPassword } from '../../validation/validation.js';
import constant from '../../utils/constant.js';

export const passwordVerify = async (req, res) => {
    try {

        const body = req.body

        let transaction = await forgotPasswordModel.findOne({ txnId: body.txnId });

        if (!transaction) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.otp.validationError.invalidTransationId });
        }

        if (transaction.expired) {
            return res.status(constant.statusCode.expired).send({ status: false, message: constant.forgotPassword.validationError.linkExpired });
        }

        const requiredFields = checkRequiredFields(['password', 'confirmPassword'], body);
        if (requiredFields !== true) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        if (body.confirmPassword !== body.password) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.forgotPassword.validationError.passwordNotMatch })
        }

        const timeDifference = new Date() - new Date(transaction.updatedAt);

        if (timeDifference > transaction.expiryTime) {
            transaction.expired = true;
            await transaction.save();
            return res.status(constant.statusCode.expired).send({ status: false, message: constant.forgotPassword.validationError.linkExpired })
        } else {
            let user = await userModel.findById(transaction.userId);
            if (!user) return res.status(404).send({ status: false, message: constant.otp.validationError.userNotFound })
            user.password = await hashPassword(body.confirmPassword);
            transaction.expired = true;
            await user.save();
            await transaction.save();
            return res.status(constant.statusCode.success).send({ status: true, message: constant.forgotPassword.passwordChange })
        }
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};