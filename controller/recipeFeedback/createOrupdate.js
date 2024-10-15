import recipeModel from '../../models/recipe.js';
import recipeFeedbackModel from '../../models/recipeFeedback.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import constant from '../../utils/constant.js';

export const createOrUpdateFeedback = async (req, res) => {
    try {
        const body = req.body;

        // Validate request body
        if (!isValidRequest(body)) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.feedback.missingFeedbackDetails });
        }

        // Check required fields
        const requiredFields = checkRequiredFields(['recipeId', 'ratingValue', 'commentText'], body);
        if (requiredFields !== true) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        if (body.ratingValue < 1 || body.ratingValue > 5) {
            return res.status(constant.statusCode.required).send({ status: false, message: constant.feedback.invalidRatingValue });
        }

        // Check if the recipe exists
        const recipe = await recipeModel.findById(body.recipeId);
        if (!recipe) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.feedback.recipeNotFound });
        }

        // Check if the user is the creator of the recipe
        if (String(recipe.creator) === String(req.user.userId)) {
            return res.status(constant.statusCode.accessDenied).send({ status: false, message: constant.feedback.ownRecipeFeedbackError });
        }

        const existingRecipeFeedback = await recipeFeedbackModel.findOne({ recipeId: body.recipeId, userId: req.user.userId });

        if (!req.headers.update) {
            if (existingRecipeFeedback) {
                return res.status(constant.statusCode.alreadyExist).send({
                    status: false,
                    message: constant.feedback.feedbackAlreadyExists
                });
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
                return res.status(constant.statusCode.notFound).send({ status: false, message: constant.feedback.feedbackNotFound });
            }

            // Update the Feedback directly with UserId included
            await recipeFeedbackModel.updateOne({ userId: req.user.userId, recipeId: body.recipeId }, { ...body });

            return res.status(constant.statusCode.success).send({ status: true, message: constant.feedback.feedbackUpdatedSuccess });
        }
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};
