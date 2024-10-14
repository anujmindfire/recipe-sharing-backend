import mongoose from 'mongoose';
import { isValidMail, isValidName, isValidPassword } from '../validation/validation.js';
import recipeFeedbackModel from '../models/recipeFeedback.js';
import constant from '../utils/constant.js';
import userModel from '../models/user.js';
import { createOTP } from '../controller/otp/create.js';
import { sendEmail } from '../services/sendEmail.js';
import fs from 'fs';
import path from 'path';

// ************************ Common Function *********************** //

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

const sendOTPByEmail = async (email, name, otp) => {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const templatePath = path.join(__dirname, '../public', 'otp.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    const currentYear = new Date().getFullYear();
    htmlTemplate = htmlTemplate
        .replace('{{name}}', name)
        .replace('{{otp}}', otp)
        .replace('{{year}}', currentYear);

    const mailOptions = {
        from: process.env.FROM,
        to: email,
        subject: constant.otp.subject,
        html: htmlTemplate,
    };

    try {
        const result = await sendEmail(mailOptions);
        if (result.messageId && result.accepted.length > 0) {
            return constant.forgotPassword.emailSuccess;
        } else {
            if (result === constant.forgotPassword.validationError.invalidCred) {
                return result;
            } else {
                throw new Error(constant.forgotPassword.validationError.errorSendEmail);
            }
        }
    } catch (error) {
        throw new Error(constant.forgotPassword.validationError.errorSendEmail);
    }
};

/**
 * Handles pagination for a global query.
 * It extracts limit and skip values from the request query.
 * If 'fetched' is not provided or is not set to 'all', it calculates 
 * pagination parameters based on the provided page and limit.
 * 
 * @param {Object} req - The request object containing query parameters.
 * @returns {Object} An object containing limit and skip values for pagination.
*/

const globalPagination = (req) => {
    const { fetched } = req.query;

    let limit = null;
    let skip = null;

    if (!fetched && (fetched !== 'all' && fetched !== 'All')) {
        limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        skip = (page - 1) * limit;
    }

    delete req.query.fetched;
    delete req.query.limit;
    delete req.query.page;

    return { limit, skip };
};

/**
 * Constructs a search condition based on a filter key for a given model.
 * It generates a MongoDB query that searches for documents matching the 
 * provided filter key across various attribute types (String, Number, Array).
 * 
 * @param {string} filterKey - The key used for searching within the model attributes.
 * @param {Object} modelObj - The Mongoose model object containing the schema.
 * @returns {Object} A MongoDB search condition object.
 */
const globalSearch = (filterKey, modelObj) => {
    if (!filterKey) return {};
    
    filterKey = (filterKey || '').replace(/\s+/g, ' ').trim();
    const searchConditions = { $or: [] };

    const excludedKeys = ['savedRecipes', 'followers', 'following'];

    const processAttribute = (key, attribute) => {
        if (excludedKeys.includes(key) || attribute.instance === 'ObjectID') {
            return;
        }
        
        if (attribute.instance === 'String') {
            searchConditions.$or.push({ [key]: { $regex: filterKey, $options: 'i' } });
        } else if (attribute.instance === 'Number') {
            const numericFilterKey = parseFloat(filterKey);
            if (!isNaN(numericFilterKey)) {
                searchConditions.$or.push({ [key]: numericFilterKey });
            }
        } else if (attribute.instance === 'Array') {
            searchConditions.$or.push({ [key]: { $regex: filterKey, $options: 'i' } });
        }
    };

    const processModelAttributes = (modelObject) => {
        const attributes = Object.keys(modelObject.schema.paths);
        attributes.forEach((key) => {
            const attribute = modelObject.schema.paths[key];
            processAttribute(key, attribute);
        });
    };

    Object.entries(modelObj.schema.paths).forEach(([key, attribute]) => {
        processAttribute(key, attribute);
        if (attribute.options && attribute.options.ref) {
            const matchedModel = mongoose.model(attribute.options.ref);
            if (matchedModel) {
                processModelAttributes(matchedModel);
            }
        }
    });

    return searchConditions;
};

/**
 * Constructs a filter condition based on query parameters from the request.
 * It supports filtering by specific fields and handles special cases like 
 * filtering by rating value using aggregation to find recipe IDs.
 * 
 * @param {Object} req - The request object containing query parameters.
 * @returns {Promise<Object>} A promise that resolves to an object containing the filter conditions.
 */
const globalFilter = async (req) => {
    const queryKeys = ['_id', 'title', 'preparationTime', 'cookingTime', 'creator'];
    const condition = queryKeys.reduce((acc, key) => {
        if (req.query[key]) {
            acc[key] = req.query[key];
        }
        return acc;
    }, {});

    // Handle the ratingValue filter
    if (req.query.ratingValue) {
        const ratingValue = parseInt(req.query.ratingValue);
        if (ratingValue >= 1 && ratingValue <= 5) {
            // Find recipes with the specified rating
            const recipesWithRating = await recipeFeedbackModel.aggregate([
                { $match: { ratingValue: ratingValue } },
                { $group: { _id: '$recipeId' } }
            ]);

            const recipeIds = recipesWithRating.map(feedback => feedback._id);
            condition._id = { $in: recipeIds };
        }
    }
    return condition;
};

const validateDetails = (body) => {
    if (!isValidName(body.name)) {
        return constant.user.validationError.invalidName;
    }
    if (body.name.length < 2 || body.name.length > 50) {
        return constant.user.validationError.nameLength;
    }
    if (!isValidMail(body.email) && !body.url.includes('/update')) {
        return constant.user.validationError.invalidEmail;
    }
    if (!isValidPassword(body.password) && !body.url.includes('/update')) {
        return constant.user.validationError.invalidPassword;
    }
    return null;
};

const handleUser = async (req, res, body) => {
    try {
        req.email = body.email;
        const otpResult = await createOTP(req, res);

        if ([constant.otp.validationError.reachLimit].includes(otpResult)) {
            return res.status(429).send({ status: false, message: otpResult });
        }

        if ([constant.otp.validationError.tryAgain].includes(otpResult)) {
            return res.status(400).send({ status: false, message: otpResult });
        }

        const emailResult = await sendOTPByEmail(body.email, body.name, otpResult.otp);
        if (emailResult === constant.forgotPassword.validationError.invalidCred) {
            return res.status(400).send({ status: false, message: constant.forgotPassword.validationError.errorSendEmail });
        }

        if (req.update) {
            await userModel.updateOne({ email: body.email }, body);
        } else {
            await userModel.create(body);
        }
        return res.status(200).send({ status: true, message: constant.otp.otpSuccess, data: { txnId: otpResult.txnId } });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
}

export {
    capitalizeFirstLetter,
    generateOTP,
    sendOTPByEmail,
    globalPagination,
    globalSearch,
    globalFilter,
    validateDetails,
    handleUser
};
