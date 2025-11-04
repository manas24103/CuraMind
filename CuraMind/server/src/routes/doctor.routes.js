import { Router } from 'express';
import { 
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
  getDoctorPatients
} from '../controllers/doctor.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected routes (require authentication)
router.use(authenticate);

// Doctor-specific routes
router.get('/:id/appointments', authorizeRoles('doctor'), getDoctorAppointments);
router.get('/:id/patients', authorizeRoles('doctor'), getDoctorPatients);

// Admin-only routes
router.post('/', authorizeRoles('admin'), createDoctor);
router.put('/:id', authorizeRoles('admin'), updateDoctor);
router.delete('/:id', authorizeRoles('admin'), deleteDoctor);

export default router;
