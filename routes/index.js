import express from 'express';
import constant from '../utils/constant.js';
import user from './user.js';
import otp from './otp.js';
import forgotPassword from './forgotPassword.js';
import auth from './auth.js';
import recipe from './recipe.js';
import recipeFeedback from './recipeFeedback.js';
import message from './message.js'
import getS3URL from './getS3Url.js';

const router = express.Router();

/****** USER ******/
router.use(user);

/****** OTP ******/
router.use(otp);

/****** FORGOT PASSWORD ******/
router.use(forgotPassword);

/****** LOGIN & LOGOUT ******/
router.use(auth);

/****** RECIPE ******/
router.use(recipe);

/****** FEEDBACK ******/
router.use(recipeFeedback);

/****** MESSAGR ******/
router.use(message);

/****** GET S3 URL ******/
router.use(getS3URL);

/****** Validating the endpoint ******/
router.all('/*', (req, res) => {
  res.status(constant.statusCode.notFound).send({ status: false, message: constant.general.notFoundError });
});

export default router;
