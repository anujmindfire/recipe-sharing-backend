import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    ingredients: [{
        type: String,
    }],
    steps: [{
        type: String,
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

const recipeModel = mongoose.model('Recipe', recipeSchema);

export default recipeModel;
