import { validateDetails } from '../../common/commonFunctions.js';
import userModel from '../../models/user.js';
import { hashPassword, isValidRequest } from '../../validation/validation.js';
import constant from '../../utils/constant.js';

export const updateUser = async (req, res) => {
    try {

        let body = req.body;
        body.url = req.url;

        if (body.email) {
            return res.status(constant.statusCode.accessDenied).send({ status: false, message: constant.user.validationError.emailRestricted })
        }

        if (!isValidRequest(body)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.missingUpdateField });
        }

        const validationErrors = validateDetails(body);
        if (validationErrors) {
            return res.status(constant.statusCode.required).send({ status: false, message: validationErrors });
        }

        if (body.confirmPassword !== body.password) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.forgotPassword.validationError.passwordNotMatch })
        }

        if (body.password) {
            body.password = await hashPassword(body.password)
        }
        await userModel.findOneAndUpdate({ _id: req.user.userId }, body, { new: true });
        return res.status(constant.statusCode.success).send({ status: true, message: constant.user.updateDone });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};