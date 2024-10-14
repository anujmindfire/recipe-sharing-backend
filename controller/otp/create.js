import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import ua from 'ua-parser';
import otpModel from '../../models/otp.js'
import { generateOTP } from '../../common/commonFunctions.js';
import constant from '../../utils/constant.js';

export const createOTP = async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const otpCode = generateOTP();
        
        const uuidWithoutHyphens = uuidv4().replace(/-/g, '');

        const body = {
            txnId: uuidWithoutHyphens,
            otp: otpCode,
            osVersion: ua.parseOS(userAgent).toString(),
            osRelease: os.release(),
            expiryTime: 600000,
            browser: ua.parseUA(userAgent).toString(),
            ipAddress: ip,
            email: req.email,
            limit: constant.otp.minLimit
        };

        const transaction = await otpModel.findOne({ email: req.email });

        if (transaction) {
            if (transaction.limit === constant.otp.maxLimit && transaction.blockedUntil !== null) {
                return await processBlockedUser(req, res, otpCode, transaction);
            }
            return await handleOTPLimit(req, res, otpCode, transaction);
        };

        const otpEntry = await otpModel.create(body);

        return { txnId: otpEntry.txnId, otp: otpEntry.otp };
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};

export const processBlockedUser = async (req, res, otp, transaction) => {
    try {
        const currentISOTime = new Date().toISOString();

        if (transaction.blockedUntil > currentISOTime) {
            return constant.otp.validationError.tryAgain;
        }

        if (transaction.blockedUntil < currentISOTime) {
            await otpModel.updateOne(
                { email: req.email ? req.email : transaction.email },
                { otp: otp, limit: constant.otp.minLimit, blockedUntil: null }
            );
            return { txnId: transaction.txnId, otp: otp };
        }

        throw new Error(constant.otp.validationError.invalidOtp);
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
}

export const handleOTPLimit = async (req, res, otp, transaction) => {
    try {
        if (transaction.limit === constant.otp.maxLimit && !transaction.blockedUntil) {
            await blockUser(req.email ? req.email : transaction.email);
            return constant.otp.validationError.reachLimit;
        }

        if (transaction.limit <= constant.otp.limit) {
            const timeForIncreaseLimit = new Date(Date.now() - 3600000);
            const updateData = { otp };

            if (new Date(transaction.updatedAt) > timeForIncreaseLimit) {
                updateData.limit = transaction.limit + constant.otp.minLimit;
            }

            if (transaction.expired) {
                updateData.expired = false;
            }

            await otpModel.updateOne(
                { email: req.email ? req.email : transaction.email },
                updateData
            );

            return { txnId: transaction.txnId, otp };
        }

        throw new Error(constant.otp.validationError.invalidOtp);
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
}

export const blockUser = async (email) => {
    try {
        const blockExpiration = new Date(Date.now() + 3600000).toISOString();
        await otpModel.updateOne(
            { email },
            { blockedUntil: blockExpiration }
        );
    } catch (error) {
        throw new Error(constant.otp.validationError.invalidOtp);
    }
}