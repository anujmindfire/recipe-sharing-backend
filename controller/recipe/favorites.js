import recipeModel from '../../models/recipe.js';
import userModel from '../../models/user.js';
import constant from '../../utils/constant.js';
import { getUniqueTimes, getQueryConditions, getFeedbackStats } from './recipeHelper.js';
import { sendErrorResponse } from '../../utils/response.js';
import moment from 'moment';

export const favoritesRecipe = async (req, res) => {
    try {
        const { limit, skip, conditions } = await getQueryConditions(req, recipeModel);
        const user = await userModel.findById(req.user.userId).select('savedRecipes');

        if (!user) {
            return sendErrorResponse(res, constant.statusCode.notFound, constant.user.validationError.userNotFound);
        }

        if (user.savedRecipes.length === 0) {
            return res.status(constant.statusCode.success).send({ status: true, message: constant.recipe.recipeNotFound, data: [] });
        }

        const totalRecipes = user.savedRecipes.length;
        const recipes = await recipeModel
            .find({ _id: { $in: user.savedRecipes }, ...conditions })
            .limit(limit)
            .skip(skip)
            .sort({ title: 1 });

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
            total: totalRecipes,
            data: recipesWithStats,
            uniquePreparationTimes,
            uniqueCookingTimes
        });
    } catch (error) {
        return sendErrorResponse(res, constant.statusCode.somethingWentWrong, constant.general.genericError, error.message);
    }
};