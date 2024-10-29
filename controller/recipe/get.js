import { getUniqueTimes, getQueryConditions, getFeedbackStats } from './recipeHelper.js';
import { isValidId } from '../../validation/validation.js';
import { sendErrorResponse } from '../../utils/response.js';
import userModel from '../../models/user.js';
import recipeModel from '../../models/recipe.js';
import recipeFeedbackModel from '../../models/recipeFeedback.js';
import constant from '../../utils/constant.js';
import moment from 'moment';

export const getRecipe = async (req, res) => {
    try {
        const { limit, skip, conditions } = await getQueryConditions(req, recipeModel);

        if (req.query._id) {
            if (!isValidId(req.query._id)) {
                return sendErrorResponse(res, constant.statusCode.required, constant.recipe.invalidID);
            }

            const recipe = await recipeModel.findById(req.query._id).populate('creator', 'name');
            if (!recipe) {
                return sendErrorResponse(res, constant.statusCode.notFound, constant.recipe.recipeNotFound);
            }

            const feedbackStats = await getFeedbackStats(recipe._id);
            const user = await userModel.findById(req.user.userId).select('savedRecipes');
            const isSaved = user.savedRecipes.includes(recipe._id);

            const responseData = {
                recipe,
                isSaved,
                feedbackData: await recipeFeedbackModel.find({ recipeId: recipe._id }).populate('userId', 'name'),
                totalRating: feedbackStats.totalReviews,
                averageRating: feedbackStats.averageRating,
                ratingPercentages: feedbackStats.ratingPercentages,
            };

            return res.status(constant.statusCode.success).send({ status: true, message: constant.general.fetchData, data: responseData });
        }

        const count = await recipeModel.countDocuments(conditions);
        const recipes = await recipeModel.find(conditions).skip(skip).limit(limit).sort({ title: 1 });

        const recipesWithStats = await Promise.all(recipes.map(async (recipe) => {
            const feedbackStats = await getFeedbackStats(recipe._id);
            return {
                ...recipe.toObject(),
                totalRating: feedbackStats.totalReviews,
                averageRating: feedbackStats.averageRating,
            };
        }));

        const { uniquePreparationTimes, uniqueCookingTimes } = await getUniqueTimes();

        return res.status(constant.statusCode.success).send({
            timestamp: moment().unix(),
            message: recipesWithStats.length > 0 ? constant.general.fetchData : constant.general.notFoundData,
            success: true,
            total: count,
            data: recipesWithStats,
            uniquePreparationTimes,
            uniqueCookingTimes
        });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};