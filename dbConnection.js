import mongoose from 'mongoose';
import dotenv from 'dotenv';
import constant from './utils/constant.js';
import logger from './utils/logger.js';
dotenv.config();

// MongoDB connection
export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL, {});
        logger.info(constant.general.mongoConnectionSuccess);
    } catch (err) {
        logger.error(constant.general.mongoConnectionError, err);
        process.exit(1);
    }
};
