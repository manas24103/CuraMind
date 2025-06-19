"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = exports.PatientController = void 0;
const patient_model_1 = require("../models/patient.model");
class PatientController {
    async getAllPatients(req, res) {
        try {
            const patients = await patient_model_1.Patient.find();
            res.json(patients);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching patients', error });
        }
    }
    async getPatientById(req, res) {
        try {
            const patient = await patient_model_1.Patient.findById(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json(patient);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching patient', error });
        }
    }
    async createPatient(req, res) {
        try {
            const patient = new patient_model_1.Patient(req.body);
            await patient.save();
            res.status(201).json(patient);
        }
        catch (error) {
            res.status(400).json({ message: 'Error creating patient', error });
        }
    }
    async updatePatient(req, res) {
        try {
            const patient = await patient_model_1.Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json(patient);
        }
        catch (error) {
            res.status(400).json({ message: 'Error updating patient', error });
        }
    }
    async deletePatient(req, res) {
        try {
            const patient = await patient_model_1.Patient.findByIdAndDelete(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.status(204).json({ message: 'Patient deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error deleting patient', error });
        }
    }
}
exports.PatientController = PatientController;
exports.patientController = new PatientController();
