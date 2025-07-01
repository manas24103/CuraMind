import { Router } from 'express';
import { 
  generateAIPrescription, 
  savePrescription, 
  createManualPrescription, 
  getPatientPrescriptions,
  getPrescriptionById 
} from '../controllers/prescription.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Generate AI prescription (creates a draft)
router.post('/generate', authenticate, generateAIPrescription);

// Save final prescription (updates draft or creates final version)
router.put('/:prescriptionId', authenticate, savePrescription);

// Create a manual prescription (direct entry by doctor)
router.post('/manual', authenticate, createManualPrescription);

// Get all prescriptions for a patient
router.get('/patient/:patientId', authenticate, getPatientPrescriptions);

// Get specific prescription
router.get('/:prescriptionId', authenticate, getPrescriptionById);

export default router;
