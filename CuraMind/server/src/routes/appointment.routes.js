import { Router } from 'express';
import { 
  createAppointment, 
  getAppointment, 
  getDoctorAppointments, 
  updateAppointment,
  deleteAppointment 
} from '../controllers/appointment.controller.js';
import { authenticateDoctor } from '../middleware/authDoctor.js';

const router = Router();

// All routes require doctor authentication
router.use(authenticateDoctor);

// Create new appointment
router.post('/', createAppointment);

// Get all appointments for the authenticated doctor
router.get('/', getDoctorAppointments);

// Get specific appointment by ID
router.get('/:id', getAppointment);

// Update appointment by ID
router.put('/:id', updateAppointment);

// Delete appointment by ID
router.delete('/:id', deleteAppointment);

export default router;
