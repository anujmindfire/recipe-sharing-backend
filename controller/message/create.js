import constant from '../../utils/constant.js';
import messageModel from '../../models/message.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import userModel from '../../models/user.js';

export const createMessage = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return res.status(400).send({ status: false, message: constant.message.missingMessageDetails });
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['sender', 'receiver', 'content'], body);
        if (requiredFields !== true) {
            return res.status(400).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        const receiverName = await userModel.findById(body.receiver).select('name');

        const socketId = global.userSockets[body.receiver];
        if (socketId) {
            const notificationMessage = `${receiverName.name} ${constant.message.notification}`;
            global.io.to(socketId).emit('message', {
                message: notificationMessage
            });
        }

        await messageModel.create(body);
        return res.status(200).send({ status: true, message: constant.message.messageSend });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
