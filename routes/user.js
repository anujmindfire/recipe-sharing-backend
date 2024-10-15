import express from 'express';
import { verifyToken } from '../controller/auth/auth.js';
import { getUser } from '../controller/user/get.js';
import { followUser } from '../controller/user/follow.js'
import { updateUser } from '../controller/user/update.js'
const apiRoutes = express.Router();

// This is the route for User Register and Details.

apiRoutes.get('/user', verifyToken, getUser);
apiRoutes.post('/follow', verifyToken, followUser)
apiRoutes.put('/update', verifyToken, updateUser);

export default apiRoutes;