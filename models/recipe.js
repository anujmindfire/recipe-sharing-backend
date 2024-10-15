import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        index: true,
    },
    description: {
        type: String,
    },
    ingredients: [{
        type: String,
        index: true,
    }],
    steps: [{
        type: String,
        index: true,
    }],
    imageUrl: {
        type: String,
    },
    preparationTime: {
        type: String,
    },
    cookingTime: {
        type: String,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { collection: 'recipe', timestamps: true });

recipeSchema.index({ title: 'text', ingredients: 'text', steps: 'text' });

const recipeModel = mongoose.model('Recipe', recipeSchema);

export default recipeModel;
