import express from 'express';
import bodyParser from 'body-parser';
import webRoutes from './routes/index.js';
import constant from './utils/constant.js';
import SocketConnection from './utils/socketConnection.js';
import { connectToMongoDB } from './dbConnection.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import setupSwaggerDocs from './swagger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/api', webRoutes);

// Swagger setup
setupSwaggerDocs(app);

app.get('/', async (req, res) => {
    res.send('Welcome peeps !');
});

// An error handling middleware
app.use((err, req, res, next) => {
    res.status(constant.statusCode.required);
    res.json({ message: constant.general.genericError, err })
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store user socket connections
global.userSockets = {};

// Start the server
const startServer = async () => {
    await connectToMongoDB();
    const socketConnection = new SocketConnection(server);
    global.io = socketConnection.io; 
    
    server.listen(process.env.PORT, () => {
        logger.info(constant.general.expressAppRunning(process.env.PORT));
    });
};

// Call the function to start the server
startServer();