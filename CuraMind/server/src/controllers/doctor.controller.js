import { Types } from 'mongoose';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/patient.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, isActive } = req.query;
    const filter = {};

    if (specialization) {
      console.log('Filtering by specialization:', specialization);
      filter.specialization = specialization;
    }
    
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      console.log('Filtering by active status:', activeStatus);
      filter.isActive = activeStatus;
    }

    
    const doctors = await Doctor.find(filter)
      .select('-password')
      .populate('specialization', 'name')
      .sort({ name: 1 })
      .catch(err => {
        console.error('Database query error in getAllDoctors:', err);
        throw err;
      });

    
    const response = {
      success: true,
      count: doctors.length,
      data: doctors,
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    const errorResponse = {
      success: false,
      message: 'Error fetching doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    };
    return res.status(500).json(errorResponse);
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-password')
      .populate('specialization', 'name')
      .populate('patients', 'name email phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message,
    });
  }
};

// Create new doctor
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      qualifications,
      consultationFee,
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists',
      });
    }

    const doctor = new Doctor({
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      qualifications,
      consultationFee,
      isActive: true,
    });

    await doctor.save();

    // Remove password from response
    const { password: _, ...doctorData } = doctor.toObject();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctorData,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }

    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message,
    });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow updating password through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('specialization', 'name');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor,
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message,
    });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Remove doctor reference from patients
    await Patient.updateMany(
      { assignedDoctor: doctor._id },
      { $unset: { assignedDoctor: '' } }
    );

    // Delete related appointments
    await Appointment.deleteMany({ doctor: doctor._id });

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message,
    });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = { doctor: req.params.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name phone')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

// Get doctor's patients
export const getDoctorPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ assignedDoctor: req.params.id })
      .select('name email phone gender age')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message,
    });
  }
};