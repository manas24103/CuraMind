import { Router } from 'express';
import { 
  createAppointment, 
  getAppointment, 
  getDoctorAppointments, 
  updateAppointment,
  deleteAppointment 
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Create appointment
router.post('/', authenticate, createAppointment);

// Get all appointments for a doctor
router.get('/', authenticate, getDoctorAppointments);

// Get specific appointment
router.get('/:id', authenticate, getAppointment);

// Update appointment
router.put('/:id', authenticate, updateAppointment);

// Delete appointment
router.delete('/:id', authenticate, deleteAppointment);

export default router;
