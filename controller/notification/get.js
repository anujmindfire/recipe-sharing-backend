import notificationModel from '../../models/notification.js';
import constant from '../../utils/constant.js';
import { isValidId } from '../../validation/validation.js';

export const getNotification = async (req, res) => {
    try {
        if (!isValidId(req.params.userId)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.invalidID });
        }

        const userId = req.params.userId;
        const notifications = await notificationModel.find({ userId }).sort({ createdAt: -1 });

        return res.status(constant.statusCode.success).send({ status: true, notifications });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};

export const updateNotification = async (req, res) => {
    try {

        if (!isValidId(req.params.notificationId)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.invalidID });
        }

        const notificationId = req.params.notificationId;
        const notification = await notificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true });

        if (!notification) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.message.notfound });
        }

        return res.status(constant.statusCode.success).send({ status: true, message: constant.message.read });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};