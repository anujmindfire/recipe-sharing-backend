import express from 'express';
import { signupUser } from '../controller/user/signup.js';
import { verifyToken } from '../controller/auth/verifyToken.js';
import { getUser } from '../controller/user/get.js';
import { followUser } from '../controller/user/follow.js'
import { updateUser } from '../controller/user/update.js'
const apiRoutes = express.Router();

// This is the route for User Register and Details.

apiRoutes.post('/user', signupUser);
apiRoutes.get('/user', verifyToken, getUser);
apiRoutes.post('/follow', verifyToken, followUser)
apiRoutes.put('/update', verifyToken, updateUser);

export default apiRoutes;