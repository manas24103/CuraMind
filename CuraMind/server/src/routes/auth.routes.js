import { Router } from 'express';
import { login, getDoctorDetails } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Login route
router.post('/login', login);

// Get current authenticated doctor's profile
router.get('/me', authenticate, getDoctorDetails);

export default router;
