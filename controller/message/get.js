import constant from '../../utils/constant.js';
import messageModel from '../../models/message.js';

export const getMessage = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;

        const message = await messageModel.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 },
            ],
        }).sort({ timestamp: 1 });
        return res.status(200).json({ data: message } );
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
