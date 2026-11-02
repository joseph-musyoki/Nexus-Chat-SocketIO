// 1. Imports
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import initializeSocket from './sockets/socket.js';

import connectDB from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// 2. Configuration
dotenv.config();

// 3. Declarations
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// 4. Middleware
app.use(cors({
    origin: process.env.CLIENT_URL
}));

app.use(express.json());

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);


// 6. Database Connection and Server Startup
const startServer = async () => {
    try {
        await connectDB();
        // Initialize Socket.IO
        initializeSocket(server);


        server.listen(PORT, () => {
            console.log(`Nexus Chat server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();