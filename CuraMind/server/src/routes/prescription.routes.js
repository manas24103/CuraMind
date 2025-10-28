import { Router } from 'express';
import { 
  generateAIPrescription, 
  savePrescription, 
  createManualPrescription, 
  getPatientPrescriptions,
  getPrescriptionById,
  finalizePrescription,
  validatePrescription
} from '../controllers/prescription.controller.js';
import { authenticateDoctor } from '../middleware/authDoctor.js';

const router = Router();

// Generate AI prescription (creates a draft)
router.post('/generate', authenticateDoctor, generateAIPrescription);

// Save or update prescription
router.put('/:prescriptionId', authenticateDoctor, savePrescription);

// Finalize prescription
router.put('/:id/finalize', authenticateDoctor, finalizePrescription);

// Create a manual prescription (direct entry by doctor)
router.post('/manual', authenticateDoctor, createManualPrescription);

// Get all prescriptions for a patient
router.get('/patient/:patientId', authenticateDoctor, getPatientPrescriptions);

// Get specific prescription
router.get('/:id', authenticateDoctor, getPrescriptionById);

// Validate prescription content
router.post('/validate', authenticateDoctor, validatePrescription);

export default router;
