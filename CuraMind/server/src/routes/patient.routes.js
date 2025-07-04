import { Router } from 'express';
import patientController from '../controllers/patient.controller.js';

const router = Router();

// Async handler utility
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Patient routes
router.get('/', asyncHandler(patientController.getAllPatients));
router.post('/', asyncHandler(patientController.createPatient));
router.get('/:id', asyncHandler(patientController.getPatientById));
router.put('/:id', asyncHandler(patientController.updatePatient));
router.delete('/:id', asyncHandler(patientController.deletePatient));

export default router;
