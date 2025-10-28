import Patient from '../models/patient.js';
import Doctor from '../models/Doctor.js';
import { Types } from 'mongoose';

// Create a new patient and assign a doctor
export const createPatient = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      dateOfBirth, 
      gender, 
      bloodGroup, 
      doctorId, 
      medicalHistory 
    } = req.body;

    // Validate required fields
    if (!name || !phone || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and doctorId are required fields'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Create new patient
    const patient = new Patient({
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      bloodGroup,
      assignedDoctor: doctorId,
      medicalHistory: medicalHistory || []
    });

    await patient.save();

    // Add patient to doctor's patient list
    doctor.patients.push(patient._id);
    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });

  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('assignedDoctor', 'name specialization')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    const patient = await Patient.findById(id)
      .populate('assignedDoctor', 'name specialization email')
      .select('-__v');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};
