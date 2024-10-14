import express from 'express';
import { verifyOTP } from '../controller/otp/verify.js';
import { resendOTP } from '../controller/otp/resend.js'
const apiRoutes = express.Router();

// this is the route for verify or refresh or created otp.

apiRoutes.post('/verify', verifyOTP);
apiRoutes.post('/resend', resendOTP);

export default apiRoutes;