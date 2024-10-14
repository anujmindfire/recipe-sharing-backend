import jwt from 'jsonwebtoken';
import userModel from '../../models/user.js';
import loginHistoryModel from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';

export const refreshAccessToken = async (req, res, next) => {
    const refreshtoken = req.headers['refreshtoken'];

    // If neither token is provided, return an error
    if (!refreshtoken) {
        return res.status(401).send({ status: false, message: constant.auth.accessDenied });
    }

    try {
        // First, try to verify the access token
        const refreshDecoded = jwt.verify(refreshtoken, process.env.REFRESHSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: refreshDecoded.userId });
        if (!user) {
            return res.status(401).send({ success: false, message: constant.auth.userUnauthorized });
        }

        const logData = await loginHistoryModel.findOne({
            userId: refreshDecoded.userId,
            refreshToken: refreshtoken,
        });

        if (!logData || logData.loggedOutAt) {
            return res.status(401).send({ success: false, message: constant.auth.tokenUnauthorized, signout: true });
        }

        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email, loginId: logData._id },
            process.env.SUPERSECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).send({
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
                return res.status(401).send({ status: false, message: constant.auth.tokenExpired, logout: true });
            }
        }
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
