import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import DoctorController from '../controllers/doctor.controller.js';

const router = Router();
const doctorController = new DoctorController();

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  if (req.doctor?.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      error: 'Admin access required' 
    });
  }
};

// Get all doctors (admin only)
router.get('/', authenticate, authorizeAdmin, doctorController.getAllDoctors);

// Get current doctor's profile
router.get('/me', authenticate, doctorController.getDoctor);

// Update current doctor's profile
router.put('/me', authenticate, doctorController.updateProfile);

// Get doctor by ID (admin only)
router.get('/:id', authenticate, authorizeAdmin, doctorController.getDoctorById);

// Update doctor (admin only)
router.put('/:id', authenticate, authorizeAdmin, doctorController.updateDoctor);

// Delete doctor (admin only)
router.delete('/:id', authenticate, authorizeAdmin, doctorController.deleteDoctor);

export default router;
