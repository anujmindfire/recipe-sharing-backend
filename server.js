import express from 'express';
import bodyParser from 'body-parser';
import webRoutes from './routes/index.js';
import constant from './utils/constant.js';
import SocketConnection from './utils/socketConnection.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/api', webRoutes);

app.get('/', async (req, res) => {
    res.send('Welcome peeps !');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store user socket connections
global.userSockets = {};

// MongoDB connection
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL, {});
        console.log(constant.general.mongoConnectionSuccess);
    } catch (err) {
        console.error(constant.general.mongoConnectionError, err);
        process.exit(1);
    }
};

// Start the server
const startServer = async () => {
    await connectToMongoDB();
    const socketConnection = new SocketConnection(server);
    global.io = socketConnection.io; 
    
    server.listen(process.env.PORT, () => {
        console.log(constant.general.expressAppRunning(process.env.PORT));
    });
};

// Call the function to start the server
startServer();