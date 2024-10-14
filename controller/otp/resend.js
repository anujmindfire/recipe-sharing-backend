import userModel from '../../models/user.js';
import otpModel from '../../models/otp.js';
import { generateOTP, sendOTPByEmail } from '../../common/commonFunctions.js';
import { processBlockedUser, handleOTPLimit } from './create.js'
import constant from '../../utils/constant.js';

export const resendOTP = async (req, res) => {
    try {

        const body = req.body;
        let otpCode = generateOTP();
        
        let transaction = await otpModel.findOne({ txnId: body.txnId });
        
        if (!transaction) {
            return res.status(400).send({ status: false, message: constant.otp.validationError.invalidTransationId });
        }

        const user = await userModel.findOne({ email: transaction.email }).select(['email', 'name']);

        if (!user) {
            return res.status(404).send({ status: false, message: constant.otp.validationError.userNotFound });
        }

        if (transaction.limit === constant.otp.maxLimit && transaction.blockedUntil !== null) {            
            const result = await processBlockedUser(req, res, otpCode, transaction);
            if ([constant.otp.validationError.tryAgain].includes(result)) {
                return res.status(400).send({ status: false, message: result });
            }
            transaction.txnId = result.txnId; 
            otpCode = result.otp;
        }

        if (transaction && transaction.blockedUntil === null) {
            const result = await handleOTPLimit(req, res, otpCode, transaction);

            if ([constant.otp.validationError.reachLimit].includes(result)) {
                return res.status(400).send({ status: false, message: result });
            }

            transaction.txnId = result.txnId; 
            otpCode = result.otp;
        }

        const emailResult = await sendOTPByEmail(user.email, user.name, otpCode);
        if (emailResult === constant.forgotPassword.validationError.invalidCred) {
            return res.status(400).send({ status: false, message: constant.forgotPassword.validationError.errorSendEmail });
        }
        return res.status(200).send({ status: true, message: constant.otp.otpSuccess, data: { txnId: transaction.txnId } });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};