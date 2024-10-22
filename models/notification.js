import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
}, { collection: 'notification', timestamps: true });

const notificationModel = mongoose.model('Notification', notificationSchema);

export default notificationModel;
