import express from 'express';
import receptionistController from '../controllers/receptionist.controller.js';
import { authenticate } from '../middleware/auth.js';
  
const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(authenticate('receptionist'));

// Patient management routes
router.route('/patients')
  .post(receptionistController.createPatient)  // Create a new patient
  .get(receptionistController.getAllPatients); // Get all patients

router.route('/patients/:id')
  .get(receptionistController.getPatientById) // Get patient by ID
  .put(receptionistController.assignDoctorToPatient) // Update patient's assigned doctor
  .delete(receptionistController.deletePatient); // Delete a patient

// Doctor management routes
router.route('/doctors')
  .get(receptionistController.getAllDoctors); // Get all doctors

// Appointment management routes
router.route('/appointments')
  .get(receptionistController.getAllAppointments) // Get all appointments
  .post(receptionistController.createAppointment); // Create new appointment

export default router;
