import constant from '../../utils/constant.js';
import messageModel from '../../models/message.js';
import notificationModel from '../../models/notification.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import userModel from '../../models/user.js';
import { sendErrorResponse } from '../../utils/response.js';

export const createMessage = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.message.missingMessageDetails);
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['sender', 'receiver', 'content'], body);
        if (requiredFields !== true) {
            return sendErrorResponse(res, constant.statusCode.required, constant.general.requiredField(requiredFields));
        }

        const receiver = await userModel.findById(body.receiver).select('name');
        if (!receiver) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.otp.validationError.userNotFound);
        }

        // Create the message
        await messageModel.create(body);

        // Create a notification for the receiver
        const notificationMessage = `${receiver.name} ${constant.message.notification}`;
        await notificationModel.create({
            userId: body.receiver,
            message: notificationMessage,
            read: false
        });

        // Emit message notification and message to the receiver for real-time communication
        const socketId = global.userSockets[body.receiver];
        if (socketId) {
            global.io.to(socketId).emit('messageNotification', { notification: notificationMessage });

            const messageBody = {
                sender: body.sender,
                receiver: body.receiver,
                content: body.content,
                createdAt: body.createdAt
            };
            global.io.to(socketId).emit('message', messageBody);
        }
        return res.status(constant.statusCode.success).send({ status: true, message: constant.message.messageSend });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};
