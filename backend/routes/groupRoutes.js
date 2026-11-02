// 1. Imports
import express from 'express';
import {
    createGroup,
    getGroups
} from '../controllers/groupController.js';

import protect from '../middleware/authMiddleware.js';

// 2. Router Declaration
const router = express.Router();

// 3. Routes
router.post('/', protect, createGroup);
router.get('/', protect, getGroups);

// 4. Export
export default router;