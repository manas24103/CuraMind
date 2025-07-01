"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Create appointment
router.post('/', auth_1.authenticate, appointment_controller_1.createAppointment);
// Get all appointments for a doctor
router.get('/', auth_1.authenticate, appointment_controller_1.getDoctorAppointments);
// Get specific appointment
router.get('/:id', auth_1.authenticate, appointment_controller_1.getAppointment);
// Update appointment
router.put('/:id', auth_1.authenticate, appointment_controller_1.updateAppointment);
// Delete appointment
router.delete('/:id', auth_1.authenticate, appointment_controller_1.deleteAppointment);
exports.default = router;
