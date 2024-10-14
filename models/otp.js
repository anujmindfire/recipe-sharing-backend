import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    txnId: {
        type: String,
        unique: true,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    osVersion: {
        type: String,
        required: false
    },
    osRelease: {
        type: String,
        required: false
    },
    browser: {
        type: String,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    expiryTime: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false
    },
    limit: {
        type: Number,
        required: false
    },
    blockedUntil: {
        type: String,
        default: null
    },
    expired: { 
        type: Boolean, 
        default: false
    }
}, { collection: 'otp', timestamps: true });

const otpModel = mongoose.model('Otp', otpSchema);

export default otpModel;