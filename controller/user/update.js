import { validateDetails } from '../../common/commonFunctions.js';
import userModel from '../../models/user.js';
import { hashPassword, isValidRequest } from '../../validation/validation.js';
import constant from '../../utils/constant.js';
import { sendErrorResponse } from '../../utils/response.js';

export const updateUser = async (req, res) => {
    try {
        let body = req.body;
        body.url = req.url;

        if (body.email) {
            return sendErrorResponse(res, constant.statusCode.accessDenied, constant.user.validationError.emailRestricted);
        }

        if (!isValidRequest(body)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.user.validationError.missingUpdateField);
        }

        const validationErrors = validateDetails(body);
        if (validationErrors) {
            return sendErrorResponse(res, constant.statusCode.required, validationErrors);
        }

        if (body.confirmPassword !== body.password) {
            return sendErrorResponse(res, constant.statusCode.required, constant.forgotPassword.validationError.passwordNotMatch);
        }

        if (body.password) {
            body.password = await hashPassword(body.password);
        }

        await userModel.findOneAndUpdate({ _id: req.user.userId }, body, { new: true });
        return res.status(constant.statusCode.success).send({ status: true, message: constant.user.updateDone });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};