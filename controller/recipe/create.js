import constant from '../../utils/constant.js';
import recipeModel from '../../models/recipe.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import { sendErrorResponse } from '../../utils/response.js';

export const createRecipe = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.recipe.missingRecipeDetails);
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['title', 'ingredients', 'steps', 'imageUrl', 'preparationTime', 'cookingTime'], body);
        if (requiredFields !== true) {
            return sendErrorResponse(res, constant.statusCode.required, constant.general.requiredField(requiredFields));
        }

        // A user can create one recipe with the same title.
        const duplicateTitle = await recipeModel.findOne({ creator: req.user.userId, title: body.title });
        if (duplicateTitle) {
            return sendErrorResponse(res, constant.statusCode.alreadyExist, constant.recipe.duplicateTitleError);
        }

        // Create the recipe directly with creator included
        const result = await recipeModel.create({
            ...body,
            creator: req.user.userId
        });

        return res.status(constant.statusCode.success).send({ status: true, message: constant.recipe.recipeCreatedSuccess, data: result });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};
