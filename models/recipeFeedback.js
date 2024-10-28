import mongoose from 'mongoose';
import constant from '../utils/constant.js';

const recipeFeedbackSchema = new mongoose.Schema({
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    ratingValue: {
        type: Number,
        min: constant.recipe.minValue,
        max: constant.recipe.maxValue,
    },
    commentText: {
        type: String,
    },
}, { collection: 'recipeFeedback', timestamps: true });

const recipeFeedbackModel = mongoose.model('RecipeFeedback', recipeFeedbackSchema);

export default recipeFeedbackModel;
