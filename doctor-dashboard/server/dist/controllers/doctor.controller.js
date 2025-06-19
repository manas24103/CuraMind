"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const Doctor_1 = __importDefault(require("../models/Doctor"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class DoctorController {
    async registerDoctor(req, res) {
        try {
            const { name, email, password, specialization, experience } = req.body;
            // Check if doctor exists
            const existingDoctor = await Doctor_1.default.findOne({ email });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Doctor already exists' });
            }
            // Hash password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Create new doctor
            const doctor = new Doctor_1.default({
                name,
                email,
                password: hashedPassword,
                specialization,
                experience,
            });
            await doctor.save();
            return res.status(201).json({ message: 'Doctor registered successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error registering doctor', error });
        }
    }
    ;
    async loginDoctor(req, res) {
        try {
            const { email, password } = req.body;
            // Find doctor
            const doctor = await Doctor_1.default.findOne({ email });
            if (!doctor) {
                return res.status(400).json({ message: 'Doctor not found' });
            }
            // Validate password
            const isValidPassword = await bcryptjs_1.default.compare(password, doctor.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Invalid password' });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ id: doctor._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            return res.json({
                token,
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    specialization: doctor.specialization,
                    experience: doctor.experience,
                },
            });
        }
        catch (error) {
            console.error('Doctor login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getDoctorProfile(req, res) {
        try {
            const doctor = await Doctor_1.default.findById(req.doctorId).select('-password');
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            return res.json(doctor);
        }
        catch (error) {
            console.error('Error fetching doctor profile:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateDoctorProfile(req, res) {
        try {
            const updates = req.body;
            const doctor = await Doctor_1.default.findByIdAndUpdate(req.doctorId, updates, { new: true, runValidators: true });
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            return res.json(doctor);
        }
        catch (error) {
            console.error('Error updating doctor profile:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAllDoctors(req, res) {
        try {
            const doctors = await Doctor_1.default.find().select('-password');
            return res.json(doctors);
        }
        catch (error) {
            console.error('Error fetching doctors:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getDoctorById(req, res) {
        try {
            const doctor = await Doctor_1.default.findById(req.params.id).select('-password');
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            return res.json(doctor);
        }
        catch (error) {
            console.error('Error fetching doctor:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createDoctor(req, res) {
        try {
            const { name, email, password, specialization, experience } = req.body;
            const existingDoctor = await Doctor_1.default.findOne({ email });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Doctor already exists' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const doctor = new Doctor_1.default({
                name,
                email,
                password: hashedPassword,
                specialization,
                experience
            });
            await doctor.save();
            return res.status(201).json({ message: 'Doctor created successfully' });
        }
        catch (error) {
            console.error('Error creating doctor:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateDoctor(req, res) {
        try {
            const { name, specialization, experience } = req.body;
            const doctor = await Doctor_1.default.findById(req.params.id);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            doctor.name = name;
            doctor.specialization = specialization;
            doctor.experience = experience;
            await doctor.save();
            return res.json({ message: 'Doctor updated successfully' });
        }
        catch (error) {
            console.error('Error updating doctor:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async deleteDoctor(req, res) {
        try {
            const doctor = await Doctor_1.default.findById(req.params.id);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            await doctor.deleteOne();
            return res.json({ message: 'Doctor deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting doctor:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.DoctorController = DoctorController;
