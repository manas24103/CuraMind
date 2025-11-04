import { Router } from 'express';
import {
  getAllAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointment.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);
// Get all appointments (with optional query params for filtering)
router.get('/', authorizeRoles('doctor', 'receptionist', 'admin'), getAllAppointments);

// Get single appointment
router.get('/:id', authorizeRoles('doctor', 'receptionist', 'admin'), getAppointment);

// Create new appointment (receptionist and admin only)
router.post('/', authorizeRoles('doctor', 'receptionist', 'admin'), createAppointment);

// Update appointment (receptionist and admin only)
router.put('/:id',authorizeRoles('doctor', 'receptionist', 'admin'), updateAppointment);

// Delete appointment (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteAppointment);

export default router;
