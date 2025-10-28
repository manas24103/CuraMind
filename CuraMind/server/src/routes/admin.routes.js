import express from 'express';
import adminController from '../controllers/admin.controller.js';
import {authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply protect and authorize middleware to all routes
// Only users with 'admin' role can access these routes
router.use(authenticate('admin'));

// Doctor routes
router.route('/doctors')
  .post(adminController.createDoctor)    // Create a new doctor
  .get(adminController.getAllDoctors);   // Get all doctors

router.route('/doctors/:id')
  .delete(adminController.deleteDoctor); // Delete a doctor

// Receptionist routes
router.route('/receptionists')
  .post(adminController.createReceptionist)    // Create a new receptionist
  .get(adminController.getAllReceptionists);   // Get all receptionists

router.route('/receptionists/:id')
  .delete(adminController.deleteReceptionist); // Delete a receptionist

export default router;
