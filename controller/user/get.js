import { globalFilter, globalPagination, globalSearch } from '../../common/commonFunctions.js';
import userModel from '../../models/user.js';
import constant from '../../utils/constant.js';
import moment from 'moment';
import mongoose from 'mongoose';

export const getUser = async (req, res) => {
    try {
        const filterConditions = await globalFilter(req);
        const { limit, skip } = globalPagination(req);
        const searchConditions = globalSearch(req.query.searchKey, userModel);
        const conditions = { ...searchConditions, ...filterConditions, verified: true };

        if (req.query.recipeId) {
            try {
                const query = req.query;
                let updateQuery;

                if (query.add === 'true') {
                    updateQuery = { $addToSet: { savedRecipes: query?.recipeId } };
                } else if (query.add === 'false') {
                    updateQuery = { $pull: { savedRecipes: query?.recipeId } };
                }

                await userModel.findByIdAndUpdate(req.user.userId, updateQuery);
                return res.status(constant.statusCode.success).send({
                    status: true,
                    message: query.add === 'true' ? constant.user.recipe.recipeSaved : constant.user.recipe.recipeUnSaved,
                });
            } catch (error) {
                return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
            }
        }

        if (req.query._id) {
            try {
                const userData = await userModel.findById(req.query._id).select(['name', 'email', 'bio', 'city', 'favouriteRecipe', 'state']);
                return res.status(constant.statusCode.success).send({ status: true, message: constant.general.fetchData, data: userData });
            } catch (error) {
                return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
            }
        }

        const loggedInUser = await userModel.findById(req.user.userId).select(['following', 'followers']);
        const followingIds = loggedInUser.following.map(id => new mongoose.Types.ObjectId(id));
        const followerIds = loggedInUser.followers.map(id => new mongoose.Types.ObjectId(id));

        if (req.query.allUser) {
            conditions._id = { $nin: [new mongoose.Types.ObjectId(req.user.userId)] };
        }

        if (req.query.following) {
            conditions._id = { $in: followingIds };
        }

        if (req.query.follower) {
            conditions._id = { $in: followerIds };
        }

        const count = await userModel.countDocuments(conditions);

        let users = await userModel.aggregate([
            { $match: conditions },
            { $sort: { name: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $addFields: {
                    unfollow: {
                        $cond: {
                            if: {
                                $or: [
                                    { $in: ["$_id", followingIds] },
                                    { $in: ["$_id", followerIds] }
                                ]
                            },
                            then: true,
                            else: false
                        }
                    },
                    followback: {
                        $cond: {
                            if: {
                                $and: [
                                    { $in: ["$_id", followerIds] },
                                    { $not: { $in: ["$_id", followingIds] } }
                                ]
                            },
                            then: true,
                            else: false
                        }
                    },
                    follow: {
                        $cond: {
                            if: {
                                $and: [
                                    { $not: { $in: ["$_id", followingIds] } },
                                    { $not: { $in: ["$_id", followerIds] } }
                                ]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: { 
                    name: 1, 
                    unfollow: 1, 
                    followback: 1, 
                    follow: 1 
                }
            }
        ]);

        return res.status(constant.statusCode.success).send({
            timestamp: moment().unix(),
            message: users.length > 0 ? constant.general.fetchData : constant.general.notFoundData,
            success: true,
            total: count,
            data: users
        });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};