const constant = {
    general: {
        welcome: 'Welcome peeps!',
        mongoConnectionSuccess: 'MongoDB is connected 👍 😄',
        expressAppRunning: (port) => `Express app running on port ${port}`,
        mongoConnectionError: 'MongoDB connection error:',
        notFoundError: 'Page not found.',
        genericError: 'Something went wrong',
        requiredField: (field) => `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        fetchData: 'Fetched data',
        notFoundData: 'No data found'
    },
    forgotPassword: {
        emailSuccess: 'Please check the email address for instructions to reset your password.',
        passwordChange: 'Password changed successfully',
        validationError: {
            reachLimit: 'You have reached the maximum email request limit for today.',
            dayLimit: 'You can only request password reset twice in a day.',
            waitTime: 'You must wait at least 10 minutes before requesting another email.',
            linkExpired: 'Link has expired',
            passwordNotMatch: 'Password does not match',
            emailRequired: 'Email is required',
            emailNotExist: 'Could not find your account.',
            errorSendEmail: 'Error sending email',
            authFailed: '535 5.7.8 Authentication failed',
            invalidCred: 'Invalid login: Authentication failed. Check your email and password.'
        },
    },
    otp: {
        forgotPassword: 'Forgot Password',
        subject: 'OTP Verification',
        otpSuccess: 'OTP Sent Successfully',
        otpVerified: 'OTP Verified',
        otpFailed: 'Failed to send OTP',
        maxLimit: 5,
        minLimit: 1,
        limit: 4,
        validationError: {
            reachLimit: 'You have reached the maximum OTP request limit. Please try again after 1 hour',
            tryAgain: 'Please try again after 1 hour',
            invalidOtp: 'Invalid OTP limit conditions',
            invalidTransationId: 'Invalid transaction ID',
            transactionNotMatch: 'Transaction ID does not match',
            otpExpired: 'OTP expired',
            otpHasBeenExpired: 'OTP has been expired',
            emailOtpNotMatch: 'Invalid OTP',
            userNotFound: 'User not found'
        }
    },
    user: {
        userCreationSuccess: 'User created successfully',
        emailAlreadyExists: 'Email Already Exist',
        phoneAlreadyExists: 'Phone Number Already Exists',
        followUser: 'Follow successfully',
        unfollowUser: 'Unfollow successfully',
        hasFollow: 'has followed you',
        updateDone: 'Update successfully',
        validationError: {
            missingFields: 'Please provide Name, Email, or Password',
            invalidName: 'Name should contain only alphabets',
            nameLength: 'Name should be between 2 and 50 characters',
            invalidEmail: 'Email is invalid',
            invalidPassword: 'Password must be 8-50 characters long consisting of at least one number, uppercase letter, lowercase letter, and special character',
            invalidPhone: 'Phone is invalid',
            invalidID: 'Invalid ID',
            alreadyFollow: 'You are already following this user',
            notFollowing: 'You are not follow this user',
            missingUpdateField: 'Please provide data to update',
            emailRestricted: 'Email is Restricted to update'
        },
        recipe: {
            recipeSaved: 'Saved Recipe',
            recipeUnSaved: 'UnSaved Recipe'
        }
    },
    feedback: {
        recipeNotFound: 'No saved recipes found',
        missingFeedbackDetails: 'Please provide Feedback details',
        invalidRatingValue: 'Rating value must be between 1 and 5.',
        recipeNotFound: 'Recipe not found',
        ownRecipeFeedbackError: 'You cannot add feedback to your own recipe',
        feedbackAlreadyExists: 'You have already added feedback for this recipe.',
        feedbackAddedSuccess: 'Feedback Added successfully',
        feedbackUpdatedSuccess: 'Feedback Updated successfully',
        feedbackNotFound: 'Feedback not found',
    },
    recipe: {
        missingRecipeDetails: 'Please provide recipe details',
        duplicateTitleError: 'You have already created a recipe with this title. Please choose a different title.',
        recipeCreatedSuccess: 'Recipe created successfully',
        recipeNotFound: 'Recipe not found',
        invalidID: 'Invalid RecipeID'
    },
    s3: {
        noFileUploaded: 'No file uploaded.',
        invalidFileSize: (currentSize) => `File size must be between 20 KB and 10 MB. Current size: ${currentSize.toFixed(2)} KB`,
    },
    auth: {
        missingLoginDetails: 'Please provide login details',
        loginSuccess: 'Logged in successfully',
        logoutSuccess: 'Logout successfully',
        invalidCredential: 'Invalid Credential',
        alreadyLoggedIn: 'You are already logged in',
        tokenExpired: 'Session expired. Please log in again.',
        accessDenied: 'Access denied',
        userUnauthorized: 'User Unauthorized',
        tokenUnauthorized: 'User Unauthorized Token',
        tokenExpiredError: 'TokenExpiredError',
        tokenRefreshed: 'Token Refresh',
        authenication: 'Authenication',
        unverified: 'Please verify first'
    },
    message: {
        missingMessageDetails: 'Please provide Message details',
        messageSend: 'Message Sent',
        notification: 'Sent a message to you',
    }
};

export default constant;
