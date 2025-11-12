import { Router } from 'express';
import { 
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  assignDoctor,
  getRecentPatients
} from '../controllers/patient.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Get all patients (admin and receptionist only)
router.get('/', authorizeRoles('admin', 'receptionist'), getAllPatients);

// Create new patient (admin and receptionist only)
router.post('/', authorizeRoles('admin', 'receptionist'), createPatient);

// Get recent patients for a doctor (doctor, admin, receptionist)
router.get('/recent/:doctorId', (req, res, next) => {
  console.log('Route hit: GET /api/patients/recent/' + req.params.doctorId);
  next();
}, authorizeRoles('admin', 'receptionist', 'doctor'), getRecentPatients);

// Get patient by ID (accessible by the patient, their doctor, admin, or receptionist)
// This must come after all other GET routes to avoid conflicts
router.get('/:id', authorizeRoles('admin', 'receptionist', 'doctor'), getPatientById);

// Update patient (admin and receptionist only)
router.put('/:id', authorizeRoles('admin', 'receptionist'), updatePatient);

// Delete patient (admin only)
router.delete('/:id', authorizeRoles('admin','receptionist'), deletePatient);

// Assign/Update doctor for a patient (admin and receptionist only)
router.put('/:id/assign-doctor', authorizeRoles('admin', 'receptionist'), assignDoctor);

export default router;
