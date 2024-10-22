import { createRecipe } from '../../controller/recipe/create.js';
import recipeModel from '../../models/recipe.js';
import constant from '../../utils/constant.js';

// Mock the recipeModel and userModel modules
jest.mock('../../models/recipe.js');
jest.mock('../../models/user.js');

describe('createRecipe Controller', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {
                title: 'Testing Recipes',
                ingredients: ['Salt', 'Pepper'],
                steps: ['Step 1', 'Step 2'],
                imageUrl: 'http://example.com/image.jpg',
                preparationTime: '15 mins',
                cookingTime: '30 mins',
                creator: 'user123',
            },
            user: { userId: 'user123' },
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
    it('should return 400 if the request body is empty', async () => {
        req.body = {};

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.required);
        expect(res.send).toHaveBeenCalledWith({
            status: false, message: constant.recipe.missingRecipeDetails
        });
    });

    // Test 2: Missing required field
    it('should return 400 if a required field is missing', async () => {
        req.body.title = '';

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.required);
        expect(res.send).toHaveBeenCalledWith({
            status: false, message: 'Title is required'
        });
    });

    // Test 3: Duplicate title
    it('should return 409 if a recipe with the same title exists for the user', async () => {
        recipeModel.findOne = jest.fn().mockResolvedValue(true);

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.alreadyExist);
        expect(res.send).toHaveBeenCalledWith({
            status: false, message: constant.recipe.duplicateTitleError
        });
    });

    // Test 4: Successful recipe creation
    it('should return 200 and create a recipe successfully', async () => {

        // Mock the findOne function to return null (no duplicate recipe)
        recipeModel.findOne = jest.fn().mockResolvedValue(null);
        
        // Mock the create function to resolve with the result
        const result = {
            title: 'Testing Recipes',
            ingredients: ['Salt', 'Pepper'],
            steps: ['Step 1', 'Step 2'],
            imageUrl: 'http://example.com/image.jpg',
            preparationTime: '15 mins',
            cookingTime: '30 mins',
            creator: 'user123',
        };
        recipeModel.create = jest.fn().mockResolvedValue(result);
        await createRecipe(req, res);
    
        expect(res.status).toHaveBeenCalledWith(constant.statusCode.success);
        expect(res.send).toHaveBeenCalledWith({
            status: true,
            message: constant.recipe.recipeCreatedSuccess,
            data: result,
        });
    });    

    // Test 5: General error
    it('should return 500 if something goes wrong', async () => {
        // Mock the findOne function to return null (no duplicate recipe)
        recipeModel.findOne = jest.fn().mockResolvedValue(null);

        // Mock the create function to reject with an error
        recipeModel.create = jest.fn().mockRejectedValue(new Error('Database error'));

        await createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(constant.statusCode.somethingWentWrong);
        expect(res.send).toHaveBeenCalledWith({
            status: false,
            message: constant.general.genericError,
        });
    });
});