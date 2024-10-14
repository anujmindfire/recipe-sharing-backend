import userModel from '../../models/user.js';
import otpModel from '../../models/otp.js';
import constant from '../../utils/constant.js';

export const verifyOTP = async (req, res) => {
    try {
        
        const body = req.body;
        const transaction = await otpModel.findOne({ txnId: body.txnId });

        if (!transaction) {
            return res.status(400).send({ status: false, message: constant.otp.validationError.transactionNotMatch });
        }

        if (transaction.expired) {
            return res.status(400).send({ status: false, message: constant.otp.validationError.otpExpired });
        }
            

        const timeDifference = new Date() - new Date(transaction.updatedAt);
        
        if (timeDifference > transaction.expiryTime) {
            await markTransactionAsExpired(transaction);
            return res.status(400).send({ status: false, message: constant.otp.validationError.otpHasBeenExpired });
        }
        
        if (body.otp !== transaction.otp) {
            return res.status(400).send({ status: false, message: constant.otp.validationError.emailOtpNotMatch });
        }

        const user = await userModel.findOne({ email: transaction.email }).select('email');
        if (!user) {
            return res.status(404).send({ status: false, message: constant.otp.validationError.userNotFound });
        }

        await verifyUser(user);
        await markTransactionAsExpired(transaction);

        return res.status(200).send({ status: true, message: constant.otp.otpVerified });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};

const markTransactionAsExpired = async (transaction) => {
    transaction.expired = true;
    await transaction.save();
};

const verifyUser = async (user) => {
    user.verified = true;
    await user.save();
};