import mongoose from 'mongoose';
import constant from '../utils/constant.js';

const loginHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        maxlength: constant.recipe.maxValue,
    },
    refreshToken: {
        type: String,
        required: true
    },
    loggedOutAt: {
        type: Date,
        default: null
    },
    loggedInAt: {
        type: Date
    },
}, { collection: 'loginHistory', timestamps: true });

const loginHistoryModel = mongoose.model('LoginHistory', loginHistorySchema);

export default loginHistoryModel;
