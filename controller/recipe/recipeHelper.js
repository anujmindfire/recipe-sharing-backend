import recipeModel from '../../models/recipe.js';
import recipeFeedbackModel from '../../models/recipeFeedback.js';
import { globalPagination, globalFilter, globalSearch } from '../../common/commonFunctions.js';

// Get unique preparation and cooking times
export const getUniqueTimes = async () => {
    const uniqueTimes = await recipeModel.aggregate([
        {
            $match: {
                preparationTime: { $ne: "" },
                cookingTime: { $ne: "" }
            }
        },
        {
            $project: {
                preparationTime: { $trim: { input: "$preparationTime" } },
                cookingTime: { $trim: { input: "$cookingTime" } }
            }
        },
        {
            $group: {
                _id: null,
                uniquePreparationTimes: { $addToSet: "$preparationTime" },
                uniqueCookingTimes: { $addToSet: "$cookingTime" }
            }
        }
    ]);

    return {
        uniquePreparationTimes: uniqueTimes[0]?.uniquePreparationTimes || [],
        uniqueCookingTimes: uniqueTimes[0]?.uniqueCookingTimes || [],
    };
};

/**
 * Arrow function to get feedback stats including review count, average rating, and rating percentages
 * @param {ObjectId} recipeId - The ID of the recipe
 * @returns {Object} - Contains total reviews, average rating, and rating percentages
 */
export const getFeedbackStats = async (recipeId) => {
    // Perform aggregation to get feedback stats
    const feedbackStats = await recipeFeedbackModel.aggregate([
        { $match: { recipeId } },
        {
            $group: {
                _id: '$recipeId',
                averageRating: { $avg: '$ratingValue' },
                reviewCount: { $sum: 1 },
                rating1Count: { $sum: { $cond: [{ $eq: ['$ratingValue', 1] }, 1, 0] } },
                rating2Count: { $sum: { $cond: [{ $eq: ['$ratingValue', 2] }, 1, 0] } },
                rating3Count: { $sum: { $cond: [{ $eq: ['$ratingValue', 3] }, 1, 0] } },
                rating4Count: { $sum: { $cond: [{ $eq: ['$ratingValue', 4] }, 1, 0] } },
                rating5Count: { $sum: { $cond: [{ $eq: ['$ratingValue', 5] }, 1, 0] } }
            }
        }
    ]);

    const totalReviews = feedbackStats.length > 0 ? feedbackStats[0].reviewCount : 0;
    const averageRating = feedbackStats.length > 0 ? Math.round(feedbackStats[0].averageRating * 10) / 10 : 0;

    // Calculate percentages
    const ratingPercentages = calculateRatingPercentages(feedbackStats[0], totalReviews);

    return { totalReviews, averageRating, ratingPercentages };
};

/**
 * Arrow function to calculate rating percentages
 * @param {Object} stats - The feedback stats from the aggregation
 * @param {number} totalReviews - Total number of reviews
 * @returns {Object} - Contains rounded percentages for each rating
 */
const calculateRatingPercentages = (stats, totalReviews) => {
    const rawPercentages = {
        rating1: totalReviews > 0 ? (stats.rating1Count / totalReviews) * 100 : 0,
        rating2: totalReviews > 0 ? (stats.rating2Count / totalReviews) * 100 : 0,
        rating3: totalReviews > 0 ? (stats.rating3Count / totalReviews) * 100 : 0,
        rating4: totalReviews > 0 ? (stats.rating4Count / totalReviews) * 100 : 0,
        rating5: totalReviews > 0 ? (stats.rating5Count / totalReviews) * 100 : 0,
    };

    // Round percentages
    const roundedPercentages = {
        rating1: Math.round(rawPercentages.rating1),
        rating2: Math.round(rawPercentages.rating2),
        rating3: Math.round(rawPercentages.rating3),
        rating4: Math.round(rawPercentages.rating4),
        rating5: Math.round(rawPercentages.rating5),
    };

    // Adjust to ensure total is 100%
    adjustPercentagesToTotal(roundedPercentages, totalReviews);

    return roundedPercentages;
};

/**
 * Arrow function to adjust the percentages to ensure they sum to 100%, 
 * but only if there are reviews. If no reviews, leave all ratings as 0%.
 * @param {Object} percentages - The rounded percentages
 * @param {number} totalReviews - The total number of reviews
 */
const adjustPercentagesToTotal = (percentages, totalReviews) => {
    if (totalReviews === 0) {
        // If there are no reviews, ensure all ratings are 0%
        percentages.rating1 = 0;
        percentages.rating2 = 0;
        percentages.rating3 = 0;
        percentages.rating4 = 0;
        percentages.rating5 = 0;
        return;
    }

    const total = Object.values(percentages).reduce((acc, curr) => acc + curr, 0);

    if (total !== 100) {
        const adjustment = 100 - total;
        percentages.rating5 += adjustment;
    }
};

// Get pagination, filter, and search conditions
export const getQueryConditions = async (req, model) => {
    const { limit, skip } = globalPagination(req);
    const filterConditions = await globalFilter(req);
    const searchConditions = globalSearch(req.query.searchKey, model);
    return { limit, skip, conditions: { ...searchConditions, ...filterConditions } };
};
