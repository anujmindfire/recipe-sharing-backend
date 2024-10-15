import express from 'express';
import { verifyToken } from '../controller/auth/auth.js';
import { createRecipe } from '../controller/recipe/create.js';
import { getRecipe } from '../controller/recipe/get.js';
import { favoritesRecipe } from '../controller/recipe/favorites.js'
const apiRoutes = express.Router();

// This is the route for Recipe.

apiRoutes.post('/recipe', verifyToken, createRecipe);
apiRoutes.get('/recipe', verifyToken, getRecipe);
apiRoutes.get('/favorites', verifyToken, favoritesRecipe)

export default apiRoutes;
