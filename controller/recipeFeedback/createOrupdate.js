import recipeModel from '../../models/recipe.js';
import recipeFeedbackModel from '../../models/recipeFeedback.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import constant from '../../utils/constant.js';
import { sendErrorResponse } from '../../utils/response.js';

export const createOrUpdateFeedback = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return sendErrorResponse(res, constant.statusCode.required, constant.feedback.missingFeedbackDetails);
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['recipeId', 'ratingValue', 'commentText'], body);
        if (requiredFields !== true) {
            return sendErrorResponse(res, constant.statusCode.required, constant.general.requiredField(requiredFields));
        }

        if (body.ratingValue < 1 || body.ratingValue > 5) {
            return sendErrorResponse(res, constant.statusCode.required, constant.feedback.invalidRatingValue);
        }

        // Check if the recipe exists
        const recipe = await recipeModel.findById(body.recipeId);
        if (!recipe) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.feedback.recipeNotFound);
        }

        // Check if the user is the creator of the recipe
        if (String(recipe.creator) === String(req.user.userId)) {
            return sendErrorResponse(res, constant.statusCode.accessDenied, constant.feedback.ownRecipeFeedbackError);
        }

        const existingRecipeFeedback = await recipeFeedbackModel.findOne({ recipeId: body.recipeId, userId: req.user.userId });

        if (!req.headers.update) {
            if (existingRecipeFeedback) {
                return sendErrorResponse(res, constant.statusCode.alreadyExist, constant.feedback.feedbackAlreadyExists);
            }

            // Create the Feedback directly with UserId included
            const result = await recipeFeedbackModel.create({
                ...body,
                userId: req.user.userId
            });

            return res.status(constant.statusCode.success).send({ status: true, message: constant.feedback.feedbackAddedSuccess, data: result });
        }

        if (req.headers.update) {
            if (!existingRecipeFeedback) {
                return sendErrorResponse(res, constant.statusCode.notFound, constant.feedback.feedbackNotFound);
            }

            // Update the Feedback directly with UserId included
            await recipeFeedbackModel.updateOne({ userId: req.user.userId, recipeId: body.recipeId }, { ...body });

            return res.status(constant.statusCode.success).send({ status: true, message: constant.feedback.feedbackUpdatedSuccess });
        }
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};
