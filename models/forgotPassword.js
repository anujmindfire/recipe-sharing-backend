import mongoose from 'mongoose';

const forgotPasswordSchema = new mongoose.Schema({
    txnId: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    expiryTime: {
        type: String,
        required: true,
    },
    expired: {
        type: Boolean,
        default: false,
    },
    requestCount: {
        type: Number,
        default: 0,
    },
    emailCount: {
        type: Number,
        default: 0,
    },
    lastEmailSent: {
        type: Date,
        default: null,
    },
}, { collection: 'forgotpassword', timestamps: true });

const forgotPasswordModel = mongoose.model('ForgotPassword', forgotPasswordSchema);

export default forgotPasswordModel;
