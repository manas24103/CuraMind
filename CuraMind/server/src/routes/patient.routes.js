import { Router } from 'express';
import { 
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patient.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Get all patients (admin and receptionist only)
router.get('/', authorizeRoles('admin', 'receptionist'), getAllPatients);

// Create new patient (admin and receptionist only)
router.post('/', authorizeRoles('admin', 'receptionist'), createPatient);

// Get patient by ID (accessible by the patient, their doctor, admin, or receptionist)
router.get('/:id', authorizeRoles('admin', 'receptionist', 'doctor'), getPatientById);

// Update patient (admin and receptionist only)
router.put('/:id', authorizeRoles('admin', 'receptionist'), updatePatient);

// Delete patient (admin only)
router.delete('/:id', authorizeRoles('admin'), deletePatient);

export default router;
