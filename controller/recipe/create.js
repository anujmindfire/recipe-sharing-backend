import constant from '../../utils/constant.js';
import recipeModel from '../../models/recipe.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';

export const createRecipe = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.recipe.missingRecipeDetails });
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['title', 'ingredients', 'steps', 'imageUrl', 'preparationTime', 'cookingTime'], body);
        if (requiredFields !== true) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        // A user can create one recipe with the same title.
        const duplicateTitle = await recipeModel.findOne({ creator: req.user.userId, title: body.title });
        if (duplicateTitle) {
            return res.status(constant.statusCode.alreadyExist).send({ status: false, message: constant.recipe.duplicateTitleError });
        }

        // Create the recipe directly with creator included
        const result = await recipeModel.create({
            ...body,
            creator: req.user.userId
        });

        return res.status(constant.statusCode.success).send({ status: true, message: constant.recipe.recipeCreatedSuccess, data: result });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};
