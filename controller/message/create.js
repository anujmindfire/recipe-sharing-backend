import constant from '../../utils/constant.js';
import messageModel from '../../models/message.js';
import notificationModel from '../../models/notification.js'
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import userModel from '../../models/user.js';

export const createMessage = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.message.missingMessageDetails });
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['sender', 'receiver', 'content'], body);
        if (requiredFields !== true) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        const receiverName = await userModel.findById(body.receiver).select('name');
        if (!receiverName) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.otp.validationError.userNotFound });
        }

        // Create the message        
        await messageModel.create(body);

        // Create a notification for the receiver
        const notificationMessage = `${receiverName.name} ${constant.message.notification}`;
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
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};
