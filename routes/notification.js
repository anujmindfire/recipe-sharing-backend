import express from 'express';
import { verifyToken } from '../controller/auth/auth.js';
import { getNotification } from '../controller/notification/get.js';
import { updateNotification } from '../controller/notification/get.js';
const apiRoutes = express.Router();

// This is the route for Notification Create and Read.

apiRoutes.get('/notification/:userId', verifyToken, getNotification);
apiRoutes.put('/notification/:notificationId/read', verifyToken, updateNotification);

export default apiRoutes;