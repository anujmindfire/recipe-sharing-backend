import express from 'express';
import { getUserInfo, createToken } from '../controller/auth/signin.js';
import { signupUser, verifyToken, refreshAccessToken, logout  } from '../controller/auth/auth.js';
const apiRoutes = express.Router();

// This is the route for login and logout.

apiRoutes.post('/auth/register', signupUser)
apiRoutes.post('/auth/signin', getUserInfo, createToken);
apiRoutes.post('/auth/logout', verifyToken, logout);
apiRoutes.post('/auth/refreshtoken', refreshAccessToken);

export default apiRoutes;
