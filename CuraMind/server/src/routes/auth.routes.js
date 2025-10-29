import { Router } from 'express';
import { login, verifyToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import cors from 'cors';

const router = Router();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS to all auth routes
router.use(cors(corsOptions));

// Public routes
router.post('/login', login);

export default router;
