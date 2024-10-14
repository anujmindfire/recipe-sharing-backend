import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        trim: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    savedRecipes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe',
        unique: true,
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    }],
    bio: {
        type: String,
        trim: true,
    },
    favouriteRecipe: {
        type: String,
        trim: true
    }
}, { collection: 'user', timestamps: true });

const userModel = mongoose.model('User', userSchema);

export default userModel;