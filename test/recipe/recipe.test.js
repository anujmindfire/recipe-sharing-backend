import { createRecipe } from '../../controller/recipe/create.js';
import recipeModel from '../../models/recipe.js';
import constant from '../../utils/constant.js';

// Mock the recipeModel and userModel modules
jest.mock('../../models/recipe.js');
jest.mock('../../models/user.js');

describe(constant.recipe.testCase.createRecipe, () => {
    let req, res;

    beforeEach(() => {
        // Deep clone the recipeBody to avoid referencing issues
        req = {
            body: JSON.parse(JSON.stringify(constant.recipe.testCase.recipeBody)),
            user: { userId: constant.recipe.testCase.recipeBody.creator },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Missing request body
    it(constant.recipe.testCase.requestBodyEmpty, async () => {
        req.body = {};

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.required);
        expect(res.send).toHaveBeenCalledWith({
            status: false,
            message: constant.recipe.missingRecipeDetails,
            error: null,
        });
    });

    // Test 2: Missing required field
    it(constant.recipe.testCase.requirefield, async () => {
        req.body.title = '';

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.required);
        expect(res.send).toHaveBeenCalledWith({
            status: false,
            message: constant.recipe.testCase.required,
            error: null,
        });
    });

    // Test 3: Duplicate title
    it(constant.recipe.testCase.duplicateTitle, async () => {
        recipeModel.findOne = jest.fn().mockResolvedValue({ title: req.body.title });

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.alreadyExist);
        expect(res.send).toHaveBeenCalledWith({
            status: false,
            message: constant.recipe.duplicateTitleError,
            error: null,
        });
    });

    // Test 4: Successful recipe creation
    it(constant.recipe.testCase.successRecipe, async () => {

        // Mock the findOne function to return null (no duplicate recipe)
        recipeModel.findOne = jest.fn().mockResolvedValue(null);
        recipeModel.create = jest.fn().mockResolvedValue(JSON.parse(JSON.stringify(constant.recipe.testCase.recipeBody)));
        await createRecipe(req, res);
    
        expect(res.status).toHaveBeenCalledWith(constant.statusCode.success);
        expect(res.send).toHaveBeenCalledWith({
            status: true,
            message: constant.recipe.recipeCreatedSuccess,
            data: JSON.parse(JSON.stringify(constant.recipe.testCase.recipeBody)),
        });
    });

    // Test 5: General error
    it(constant.recipe.testCase.somethingWrong, async () => {
        recipeModel.findOne = jest.fn().mockResolvedValue(null);
        recipeModel.create = jest.fn().mockRejectedValue(new Error(constant.recipe.testCase.error));

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.somethingWentWrong);
        expect(res.send).toHaveBeenCalledWith({
            status: false,
            message: constant.general.genericError,
            error: constant.recipe.testCase.error,
        });
    });
});