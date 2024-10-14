import express from 'express';
import { sendEmailForForgotPassword } from '../controller/forgotPassword/create.js';
import { passwordVerify } from '../controller/forgotPassword/verify.js';
const apiRoutes = express.Router();

// This is the route for send Email for Forgot Password or Verify Forgot Password.

apiRoutes.post('/password/sendEmail', sendEmailForForgotPassword);
apiRoutes.post('/password/verify', passwordVerify);

export default apiRoutes;
