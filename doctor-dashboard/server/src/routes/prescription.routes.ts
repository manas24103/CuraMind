import express from 'express';
import { 
  generateAIPrescription, 
  savePrescription, 
  createManualPrescription, 
  getPatientPrescriptions,
  getPrescriptionById 
} from '../controllers/prescription.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Generate AI prescription (creates a draft)
router.post('/generate', authenticate, generateAIPrescription);

// Save final prescription (updates draft or creates final version)
router.put('/:prescriptionId', authenticate, savePrescription);

// Create a manual prescription (direct entry by doctor)
router.post('/manual', authenticate, createManualPrescription);

// Get all prescriptions for a patient
router.get('/patient/:patientId', authenticate, getPatientPrescriptions);

// Get a specific prescription by ID
router.get('/:id', authenticate, getPrescriptionById);

export default router;
