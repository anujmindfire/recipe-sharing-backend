import mongoose from 'mongoose';

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
        min: 1,
        max: 5,
    },
    commentText: {
        type: String,
    },
}, { collection: 'recipeFeedback', timestamps: true });

const recipeFeedbackModel = mongoose.model('RecipeFeedback', recipeFeedbackSchema);

export default recipeFeedbackModel;
