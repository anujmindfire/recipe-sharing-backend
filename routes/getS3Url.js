import express from 'express';
import multer from 'multer';
import { generateS3URL } from '../controller/getS3Url/generateS3URL.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const apiRoutes = express.Router();

// This is the route for upload image.

apiRoutes.post('/getS3Url', upload.single('image'), generateS3URL);

export default apiRoutes;
