import { Router } from 'express';
import { 
  getAllReceptionists,
  getReceptionistById,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
  assignDoctorToPatient
} from '../controllers/receptionist.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Get all receptionists (admin only)
router.get('/', authorizeRoles('admin'), getAllReceptionists);

// Create new receptionist (admin only)
router.post('/', authorizeRoles('admin'), createReceptionist);

// Get receptionist by ID (admin only)
router.get('/:id', authorizeRoles('admin'), getReceptionistById);

// Update receptionist (admin only)
router.put('/:id', authorizeRoles('admin'), updateReceptionist);

// Delete receptionist (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteReceptionist);

// Assign doctor to patient (admin only)
router.post('/:id/assign-doctor', authorizeRoles('admin'), assignDoctorToPatient);

export default router;