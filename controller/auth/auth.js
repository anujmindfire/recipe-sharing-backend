import jwt from 'jsonwebtoken';
import userModel from '../../models/user.js';
import loginHistoryModel from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';
import { checkRequiredFields, hashPassword, isValidRequest } from '../../validation/validation.js';
import { handleUser, validateDetails } from '../../common/commonFunctions.js';

export const signupUser = async (req, res) => {
    try {
        const body = req.body;

        if (!isValidRequest(body)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.missingFields });
        }

        const requiredFields = checkRequiredFields(['name', 'email', 'password'], body);
        if (requiredFields !== true) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        const validationErrors = validateDetails(body);
        if (validationErrors) {
            return res.status(constant.statusCode.required).send({ status: false, message: validationErrors });
        }

        const isExistEmail = await userModel.findOne({ email: body.email });
        if (isExistEmail && isExistEmail.verified) {
            return res.status(constant.statusCode.alreadyExist).send({ status: false, message: constant.user.emailAlreadyExists });
        }

        body.password = await hashPassword(body.password);

        if (isExistEmail && !isExistEmail.verified) {
            req.update = true;
            return handleUser(req, res, body);
        }

        return handleUser(req, res, body);
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};

export const verifyToken = async (req, res, next) => {
    const accessToken = req.headers['accesstoken'];

    // If neither token is provided, return an error
    if (!accessToken) {
        return res.status(constant.statusCode.accessDenied).send({ status: false, message: constant.auth.accessDenied });
    }

    try {
        // First, try to verify the access token
        const decoded = jwt.verify(accessToken, process.env.SUPERSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(constant.statusCode.notFound).send({ success: false, message: constant.auth.userUnauthorized });
        }

        const logData = await loginHistoryModel.findOne({ userId: decoded.userId, _id: decoded.loginId });
        if (!logData || logData.loggedOutAt) {
            return res.status(constant.statusCode.unauthorized).send({ success: false, message: constant.auth.tokenUnauthorized });
        }

        // If access token is valid, attach user data to request
        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name === constant.auth.tokenExpiredError) {
            return res.status(constant.statusCode.unauthorized).send({ success: false, message: constant.auth.tokenUnauthorized, unauthorized: true });
        }
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};

export const refreshAccessToken = async (req, res, next) => {
    const refreshtoken = req.headers['refreshtoken'];

    // If neither token is provided, return an error
    if (!refreshtoken) {
        return res.status(constant.statusCode.accessDenied).send({ status: false, message: constant.auth.accessDenied });
    }

    try {
        // First, try to verify the access token
        const refreshDecoded = jwt.verify(refreshtoken, process.env.REFRESHSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: refreshDecoded.userId });
        if (!user) {
            return res.status(constant.statusCode.notFound).send({ success: false, message: constant.auth.userUnauthorized });
        }

        const logData = await loginHistoryModel.findOne({
            userId: refreshDecoded.userId,
            refreshToken: refreshtoken,
        });

        if (!logData || logData.loggedOutAt) {
            return res.status(constant.statusCode.unauthorized).send({ success: false, message: constant.auth.tokenUnauthorized, signout: true });
        }

        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email, loginId: logData._id },
            process.env.SUPERSECRET,
            { expiresIn: '1d' }
        );

        return res.status(constant.statusCode.success).send({
            success: true,
            message: constant.auth.tokenRefreshed,
            accessToken: newAccessToken,
        });
    } catch (error) {
        if (error.name === constant.auth.tokenExpiredError) {
            const result = await loginHistoryModel.updateOne(
                { userId: req.headers.id, refreshToken: req.headers.refreshtoken },
                { loggedOutAt: new Date() },
                { sort: { createdAt: -1 }, new: true }
            );
            if (result && result.modifiedCount > 0) {
                return res.status(constant.statusCode.unauthorized).send({ status: false, message: constant.auth.tokenExpired, logout: true });
            }
        }
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};

export const logout = async (req, res) => {
    try {
        const data = await loginHistoryModel.updateOne({ _id: req.user.loginId }, { loggedOutAt: new Date() });
        if (data && data.modifiedCount > 0) {
            return res.status(constant.statusCode.success).send({ status: true, message: constant.auth.logoutSuccess });
        }
        return res.status(constant.statusCode.unauthorized).send({ status: true, message: constant.auth.userUnauthorized });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};
