import loginHistoryModel from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';

export const logout = async (req, res) => {
    try {
        const data = await loginHistoryModel.updateOne({ _id: req.user.loginId }, { loggedOutAt: new Date() });
        if (data && data.modifiedCount > 0) {
            return res.status(200).send({ status: true, message: constant.auth.logoutSuccess });
        }
        return res.status(401).send({ status: true, message: constant.auth.userUnauthorized });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
