// 1. Imports
import express from 'express';
import { getUsers } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

// 2. Router Declaration
const router = express.Router();

// 3. Routes
router.get('/', protect, getUsers);

// 4. Export
export default router;