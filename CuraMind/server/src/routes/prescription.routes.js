// In server/src/routes/prescription.routes.js
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
import { authenticate, authorizeRoles } from '../middleware/auth.js';  // Add authenticate import

const router = Router();

// Add authenticate middleware to all routes
router.use(authenticate);

// Now these routes will first authenticate the token, then check the role
router.post('/generate', authorizeRoles('doctor'), generateAIPrescription);
router.put('/:prescriptionId', authorizeRoles('doctor'), savePrescription);
router.put('/:id/finalize', authorizeRoles('doctor'), finalizePrescription);
router.post('/manual', authorizeRoles('doctor'), createManualPrescription);
router.get('/patient/:patientId', authorizeRoles('doctor'), getPatientPrescriptions);
router.get('/doctor/:doctorId', authorizeRoles('doctor'), getDoctorPrescriptions);
router.get('/:id', authorizeRoles('doctor'), getPrescriptionById);
router.post('/validate', authorizeRoles('doctor'), validatePrescription);

export default router;