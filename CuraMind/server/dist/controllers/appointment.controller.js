"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointment = exports.getDoctorAppointments = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
// Get all appointments for a doctor
const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment_1.default.find({ doctorId: req.params.doctorId });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching doctor appointments', error });
    }
};
exports.getDoctorAppointments = getDoctorAppointments;
// Get specific appointment
const getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching appointment', error });
    }
};
exports.getAppointment = getAppointment;
// Create appointment
const createAppointment = async (req, res) => {
    try {
        const appointment = new Appointment_1.default(req.body);
        await appointment.save();
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating appointment', error });
    }
};
exports.createAppointment = createAppointment;
// Update appointment
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating appointment', error });
    }
};
exports.updateAppointment = updateAppointment;
// Delete appointment
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findByIdAndDelete(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        res.json({ message: 'Appointment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting appointment', error });
    }
};
exports.deleteAppointment = deleteAppointment;
