import express from 'express';
import { 
  createPatient, 
  getAllPatients, 
  getPatientById 
} from '../controllers/receptionist.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(authenticate);
router.use(authorizeRoles('receptionist', 'admin'));

// Patient management routes
router.route('/patients')
  .post(createPatient)        // Create a new patient
  .get(getAllPatients);       // Get all patients

router.route('/patients/:id')
  .get(getPatientById);       // Get patient by ID

export default router;
