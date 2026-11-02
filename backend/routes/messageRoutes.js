// 1. Imports
import express from 'express';

import {
    getPrivateMessages,
    getGroupMessages
} from '../controllers/messageController.js';

import protect from '../middleware/authMiddleware.js';

// 2. Router Configuration
const router = express.Router();

// 3. Routes
router.get('/private/:userId', protect, getPrivateMessages);
router.get('/group/:groupId', protect, getGroupMessages);

// 4. Export
export default router;