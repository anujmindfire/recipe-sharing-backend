import jwt from 'jsonwebtoken';
import userModel from '../../models/user.js';
import loginHistoryModel from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';

export const verifyToken = async (req, res, next) => {
    const accessToken = req.headers['accesstoken'];

    // If neither token is provided, return an error
    if (!accessToken) {
        return res.status(401).send({ status: false, message: constant.auth.accessDenied });
    }

    try {
        // First, try to verify the access token
        const decoded = jwt.verify(accessToken, process.env.SUPERSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(400).send({ success: false, message: constant.auth.userUnauthorized });
        }

        const logData = await loginHistoryModel.findOne({ userId: decoded.userId, _id: decoded.loginId });
        if (!logData || logData.loggedOutAt) {
            return res.status(401).send({ success: false, message: constant.auth.tokenUnauthorized });
        }

        // If access token is valid, attach user data to request
        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name === constant.auth.tokenExpiredError) {
            return res.status(401).send({ success: false, message: constant.auth.tokenUnauthorized, unauthorized: true });
        }
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
