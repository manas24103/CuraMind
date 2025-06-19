import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { DoctorController } from '../controllers/doctor.controller';
import { IDoctor } from '../models/Doctor';

const router = Router();
const doctorController = new DoctorController();

// Admin authorization middleware
const authorizeAdmin = (req: any, res: any, next: any) => {
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
router.get('/', authenticate, authorizeAdmin, (req, res) => {
  doctorController.getAllDoctors(req, res);
});

// Get current authenticated doctor's profile
router.get('/me', authenticate, (req, res) => {
  doctorController.getDoctor(req, res);
});

// Get doctor by ID (admin or self)
router.get<{ id: string }>('/:id', authenticate, (req, res) => {
  doctorController.getDoctorById(req, res);
});

// Create new doctor (admin only)
router.post('/', authenticate, authorizeAdmin, (req, res) => {
  doctorController.createDoctor(req, res);
});

// Update doctor (admin or self for non-admin fields)
router.put<{ id: string }>('/:id', authenticate, (req, res) => {
  doctorController.updateDoctor(req, res);
});

// Delete doctor (admin only)
router.delete<{ id: string }>('/:id', authenticate, authorizeAdmin, (req, res) => {
  doctorController.deleteDoctor(req, res);
});

// Update current doctor's profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    await doctorController.updateProfile(req, res);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
export default router;
