import express from 'express';
import { getUserInfo, createToken } from '../controller/auth/signin.js';
import { logout } from '../controller/auth/logout.js';
import { verifyToken } from '../controller/auth/verifyToken.js';
import { refreshAccessToken } from '../controller/auth/refreshToken.js'
const apiRoutes = express.Router();

// This is the route for login and logout.

apiRoutes.post('/auth/signin', getUserInfo, createToken);
apiRoutes.post('/auth/logout', verifyToken, logout);
apiRoutes.post('/auth/refreshtoken', refreshAccessToken);

export default apiRoutes;
