import { Router } from 'express';
import { 
  getDashboardStats, 
} from '../controllers/doctor.controller.js';
import { login } from '../controllers/auth.controller.js';
import { authenticateDoctor } from '../middleware/authDoctor.js';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.use(authenticateDoctor);
// Doctor dashboard
router.get('/:doctorId/stats', getDashboardStats);

export default router;
