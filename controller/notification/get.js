import notificationModel from '../../models/notification.js';
import constant from '../../utils/constant.js';
import { isValidId } from '../../validation/validation.js';
import { sendErrorResponse } from '../../utils/response.js';

export const getNotification = async (req, res) => {
    try {
        if (!isValidId(req.params.userId)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.user.validationError.invalidID);
        }

        const userId = req.params.userId;
        const notifications = await notificationModel.find({ userId }).sort({ createdAt: -1 });

        return res.status(constant.statusCode.success).send({ status: true, notifications });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};

export const updateNotification = async (req, res) => {
    try {
        if (!isValidId(req.params.notificationId)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.user.validationError.invalidID);
        }

        const notificationId = req.params.notificationId;
        const notification = await notificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true });

        if (!notification) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.message.notfound);
        }

        return res.status(constant.statusCode.success).send({ status: true, message: constant.message.read });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};