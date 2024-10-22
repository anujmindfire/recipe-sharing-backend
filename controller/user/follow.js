import notificationModel from '../../models/notification.js';
import userModel from '../../models/user.js';
import constant from '../../utils/constant.js';
import { isValidId } from '../../validation/validation.js';

export const followUser = async (req, res) => {
    const body = req.body;

    if (!isValidId(body.followerId) || !isValidId(body.followedId)) {
        return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.invalidID });
    }

    try {
        const follower = await userModel.findById(body.followerId);
        const followed = await userModel.findById(body.followedId);

        if (!follower || !followed) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.otp.validationError.userNotFound });
        }

        if (body.follow && !body.unfollowBody) {
            if (follower.following.includes(body.followedId)) {
                return res.status(constant.statusCode.alreadyExist).send({ status: false, message: constant.user.validationError.alreadyFollow });
            }

            await userModel.findByIdAndUpdate(body.followedId, {
                $addToSet: { followers: body.followerId }
            });

            await userModel.findByIdAndUpdate(body.followerId, {
                $addToSet: { following: body.followedId }
            });

            const followerData = await userModel.findById(body.followerId).select('name');

            const notificationMessage = `${followerData.name} ${constant.user.hasFollow}`;
            await notificationModel.create({
                userId: body.followedId,
                message: notificationMessage,
                read: false
            });

            const socketId = global.userSockets[body.followedId];
            if (socketId) {
                global.io.to(socketId).emit('notification', {
                    message: notificationMessage
                });
            }
            return res.status(constant.statusCode.success).send({ status: true, message: constant.user.followUser });
        } else if (!body.follow && !body.unfollowBody) {
            if (!follower.following.includes(body.followedId)) {
                return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.notFollowing });
            }

            await userModel.findByIdAndUpdate(body.followedId, {
                $pull: { followers: body.followerId }
            });

            await userModel.findByIdAndUpdate(body.followerId, {
                $pull: { following: body.followedId }
            });
            return res.status(constant.statusCode.success).send({ status: true, message: constant.user.unfollowUser });
        } else if (!body.follow && body.unfollowBody) {
            if (!followed.following.includes(body.followerId)) {
                return res.status(constant.statusCode.required).send({ status: false, message: constant.user.validationError.notFollowing });
            }

            await userModel.findByIdAndUpdate(body.followerId, {
                $pull: { followers: body.followedId }
            });

            await userModel.findByIdAndUpdate(body.followedId, {
                $pull: { following: body.followerId }
            });
            return res.status(constant.statusCode.success).send({ status: true, message: constant.user.unfollowUser });
        }
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};