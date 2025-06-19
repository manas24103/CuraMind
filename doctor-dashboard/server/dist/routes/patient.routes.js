"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const router = (0, express_1.Router)();
// Patient routes
router.get('/', async (req, res) => patient_controller_1.patientController.getAllPatients(req, res));
router.post('/', async (req, res) => patient_controller_1.patientController.createPatient(req, res));
exports.default = router;
