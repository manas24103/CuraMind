import { Router } from 'express';
import { createTestDoctor } from '../controllers/test.controller.js';

const router = Router();

// Create test doctor
router.post('/test-doctor', createTestDoctor);

export default router;
