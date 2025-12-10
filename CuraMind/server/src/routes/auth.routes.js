import { Router } from 'express';
import { login, verifyToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);

export default router;
