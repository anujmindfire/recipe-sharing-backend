import express from 'express';
import { createMessage } from '../controller/message/create.js';
import { getMessage } from '../controller/message/get.js'
import { verifyToken } from '../controller/auth/auth.js';
const apiRoutes = express.Router();

// This is the route for Message.

apiRoutes.post('/send', verifyToken, createMessage);
apiRoutes.get('/chat/:userId1/:userId2', verifyToken, getMessage);

export default apiRoutes;