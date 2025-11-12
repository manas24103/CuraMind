import { Router } from 'express';
import { 
  generateAIPrescription, 
  savePrescription, 
  createManualPrescription, 
  getPatientPrescriptions,
  getPrescriptionById,
  finalizePrescription,
  validatePrescription,
  getDoctorPrescriptions
} from '../controllers/prescription.controller.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Generate AI prescription (creates a draft)
router.post('/generate', authorizeRoles('doctor'), generateAIPrescription);

// Save or update prescription
router.put('/:prescriptionId', authorizeRoles('doctor'), savePrescription);

// Finalize prescription
router.put('/:id/finalize', authorizeRoles('doctor'), finalizePrescription);

// Create a manual prescription (direct entry by doctor)
router.post('/manual', authorizeRoles('doctor'), createManualPrescription);

// Get all prescriptions for a patient
router.get('/patient/:patientId', authorizeRoles('doctor'), getPatientPrescriptions);

// Get all prescriptions by doctor
router.get('/doctor/:doctorId', authorizeRoles('doctor'), getDoctorPrescriptions);

// Get specific prescription
router.get('/:id', authorizeRoles('doctor'), getPrescriptionById);

// Validate prescription content
router.post('/validate', authorizeRoles('doctor'), validatePrescription);

export default router;
