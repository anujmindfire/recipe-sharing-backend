import jwt from 'jsonwebtoken';
import userModel from '../../models/user.js';
import loginHistoryModel from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';
import { checkRequiredFields, hashPassword, isValidRequest } from '../../validation/validation.js';
import { handleUser, validateDetails } from '../../common/commonFunctions.js';
import { sendErrorResponse } from '../../utils/response.js';

export const signupUser = async (req, res) => {
    try {
        const body = req.body;

        if (!isValidRequest(body)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.user.validationError.missingFields);
        }

        const requiredFields = checkRequiredFields(['name', 'email', 'password'], body);
        if (requiredFields !== true) {
            return sendErrorResponse(res, constant.statusCode.required, constant.general.requiredField(requiredFields));
        }

        const validationErrors = validateDetails(body);
        if (validationErrors) {
            return sendErrorResponse(res, constant.statusCode.required, validationErrors);
        }

        const isExistEmail = await userModel.findOne({ email: body.email });
        if (isExistEmail && isExistEmail.verified) {
            return sendErrorResponse(res, constant.statusCode.alreadyExist, constant.user.emailAlreadyExists);
        }

        body.password = await hashPassword(body.password);

        if (isExistEmail && !isExistEmail.verified) {
            req.update = true;
            return handleUser(req, res, body);
        }

        return handleUser(req, res, body);
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};

export const verifyToken = async (req, res, next) => {
    const accessToken = req.headers['accesstoken'];

    // If neither token is provided, return an error
    if (!accessToken) {
        return sendErrorResponse(res, constant.statusCode.accessDenied, constant.auth.accessDenied);
    }

    try {
        // First, try to verify the access token
        const decoded = jwt.verify(accessToken, process.env.SUPERSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: decoded.userId });
        if (!user) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.auth.userUnauthorized);
        }

        const logData = await loginHistoryModel.findOne({ userId: decoded.userId, _id: decoded.loginId });
        if (!logData || logData.loggedOutAt) {
            return sendErrorResponse(res, constant.statusCode.unauthorized, constant.auth.tokenUnauthorized);
        }

        // If access token is valid, attach user data to request
        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name === constant.auth.tokenExpiredError) {
            return res.status(constant.statusCode.unauthorized).send({ success: false, message: constant.auth.tokenUnauthorized, unauthorized: true });
        }
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};

export const refreshAccessToken = async (req, res) => {
    const refreshtoken = req.headers['refreshtoken'];

    // If neither token is provided, return an error
    if (!refreshtoken) {
        return sendErrorResponse(res, constant.statusCode.accessDenied, constant.auth.accessDenied);
    }

    try {
        // First, try to verify the refresh token
        const refreshDecoded = jwt.verify(refreshtoken, process.env.REFRESHSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: refreshDecoded.userId });
        if (!user) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.auth.userUnauthorized);
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
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};

export const logout = async (req, res) => {
    try {
        const data = await loginHistoryModel.updateOne({ _id: req.user.loginId }, { loggedOutAt: new Date() });
        if (data && data.modifiedCount > 0) {
            return res.status(constant.statusCode.success).send({ status: true, message: constant.auth.logoutSuccess });
        }
        return sendErrorResponse(res, constant.statusCode.unauthorized, constant.auth.userUnauthorized);
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};