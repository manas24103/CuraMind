import { Router, Request, Response, NextFunction } from 'express';
import { login } from '../controllers/auth.controller';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Login route
router.post('/login', login);

// Get current authenticated doctor's profile
const doctorController = new DoctorController();
router.get('/me', authenticate, (req, res) => {
  doctorController.getDoctor(req, res);
});

export default router;
