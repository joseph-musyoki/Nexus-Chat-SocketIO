// 1. Imports
import express from 'express';
import { register, login } from '../controllers/authController.js';

// 2. Router Declaration
const router = express.Router();

// 3. Routes
router.post('/register', register);
router.post('/login', login);

// 4. Export
export default router;