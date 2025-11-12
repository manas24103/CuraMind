import mongoose from 'mongoose';
import Patient from '../models/patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// Create a new patient
export const createPatient = async (req, res) => {
  try {
    const body = req.body.patient || req.body;
    const {
      name,
      email,
      phone,
      address,
      age,
      gender,
      assignedDoctor,
      medicalHistory = []
    } = body;

    // Validate required fields
    if (!name || !phone || !email || !address || age === undefined || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email, address, age, and gender are required fields',
      });
    }

    // Validate address structure
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Address must include street, city, state, and pincode',
      });
    }

    // Check if doctor exists if assigned
    if (assignedDoctor) {
      const doctor = await Doctor.findById(assignedDoctor);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Assigned doctor not found',
        });
      }
    }

    // Create patient
    const patient = new Patient({
      name,
      email,
      phone,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      },
      age: Number(age),
      gender: gender.toLowerCase(),
      assignedDoctor: assignedDoctor || null,
      medicalHistory: Array.isArray(medicalHistory) 
        ? medicalHistory.map(record => ({
            date: record.date || new Date(),
            diagnosis: record.diagnosis || '',
            prescriptions: Array.isArray(record.prescriptions) 
              ? record.prescriptions.map(med => ({
                  medicine: med.medicine || '',
                  dosage: med.dosage || '',
                  duration: Number(med.duration) || 0
                }))
              : []
          }))
        : []
    });

    // Save patient
    await patient.save();
    
    // Update doctor's patients list if assigned
    if (assignedDoctor) {
      await Doctor.findByIdAndUpdate(
        assignedDoctor,
        { $addToSet: { patients: patient._id } }
      );
    }

    // Return success response
    console.log('Sending response...');
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient,
    });
  } catch (error) {
    console.error('Error in createPatient:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A patient with this ${field} already exists`,
        field
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Error creating patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    // Extract query parameters
    const { name, email, doctor, city, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // Build query filters
    if (name) query.name = { $regex: name, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (doctor) query.assignedDoctor = doctor;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    
    
    // Execute query with pagination
    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate({
          path: 'assignedDoctor',
          select: 'name specialization email',
          model: 'Doctor'
        })
        .select('-__v')
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean()
        .exec()
        .then(result => {
          return result;
        })
        .catch(err => {
          throw err;
        }),
      
      Patient.countDocuments(query)
        .then(count => {
          return count;
        })
        .catch(err => {
          throw err;
        })
    ]);
    
    
    
    // Calculate pagination values
    const pages = Math.ceil(total / limit);
    const currentPage = Math.min(Math.max(1, parseInt(page)), pages);
    
    const response = {
      success: true,
      count: patients.length,
      total,
      pages,
      currentPage,
      data: patients,
    };
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in getAllPatients:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter',
        error: error.message
      });
    }
    
    // General error response
    const errorResponse = {
      success: false,
      message: 'Error fetching patients',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while fetching patients'
    };
    
    console.error('Sending error response:', errorResponse);
    return res.status(500).json(errorResponse);
  }
};

// Get single patient by ID
export const getPatientById = async (req, res) => {
  
  try {
    // Validate patient ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
      });
    }

    // Find patient with populated data
    const patient = await Patient.findById(req.params.id)
      .populate({
        path: 'assignedDoctor',
        select: 'name specialization email phone',
        model: 'Doctor'
      })
      .populate({
        path: 'appointments',
        select: 'date time status notes',
        options: { sort: { date: -1, time: -1 } },
        populate: {
          path: 'doctor',
          select: 'name specialization',
          model: 'Doctor'
        }
      })
      .select('-__v')
      .lean()
      .exec();

    // Check if patient exists
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    
    // Return patient data
    res.status(200).json({
      success: true,
      data: patient,
    });
    
  } catch (error) {
    console.error('Error in getPatientById:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
        error: error.message
      });
    }
    
    // General error response
    res.status(500).json({
      success: false,
      message: 'Error fetching patient details',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while fetching patient details'
    });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  
  try {
    // Validate patient ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
      });
    }

    const { assignedDoctor, address, ...updateData } = req.body;
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Handle doctor assignment if provided
        if (assignedDoctor) {
          // Check if new doctor exists
          const doctor = await Doctor.findById(assignedDoctor).session(session);
          if (!doctor) {
            throw { status: 404, message: 'Assigned doctor not found' };
          }
          
          // Get current patient to check for existing doctor
          const currentPatient = await Patient.findById(req.params.id)
            .select('assignedDoctor')
            .session(session);
            
          if (!currentPatient) {
            throw { status: 404, message: 'Patient not found' };
          }
          
          // If changing doctors, update both old and new doctor's patient lists
          if (currentPatient.assignedDoctor?.toString() !== assignedDoctor) {
            // Remove from old doctor's patients
            if (currentPatient.assignedDoctor) {
              await Doctor.findByIdAndUpdate(
                currentPatient.assignedDoctor,
                { $pull: { patients: req.params.id } },
                { session }
              );
            }
            
            // Add to new doctor's patients
            await Doctor.findByIdAndUpdate(
              assignedDoctor,
              { $addToSet: { patients: req.params.id } },
              { session }
            );
            
            updateData.assignedDoctor = assignedDoctor;
          }
        }
        
        // Handle address updates if provided
        if (address) {
          // Validate address structure
          if (address.street || address.city || address.state || address.pincode) {
            updateData.$set = updateData.$set || {};
            updateData.$set.address = {
              street: address.street || '',
              city: address.city || '',
              state: address.state || '',
              pincode: address.pincode || ''
            };
          }
        }
        
        // Update the patient
        const updatedPatient = await Patient.findByIdAndUpdate(
          req.params.id,
          updateData,
          { 
            new: true, 
            runValidators: true, 
            session,
            context: 'query' 
          }
        )
        .populate({
          path: 'assignedDoctor',
          select: 'name specialization email',
          model: 'Doctor'
        })
        .select('-__v')
        .lean();
        
        if (!updatedPatient) {
          throw { status: 404, message: 'Patient not found' };
        }
        
        // Commit the transaction
        await session.commitTransaction();
        
        // Return success response
        res.status(200).json({
          success: true,
          message: 'Patient updated successfully',
          data: updatedPatient,
        });
      });
    } catch (error) {
      // If there's an error, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      await session.endSession();
    }
    
  } catch (error) {
    console.error('Error in updatePatient:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A patient with this ${field} already exists`,
        field
      });
    }
    
    // Handle custom errors from transaction
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message || 'Error updating patient',
      });
    }
    
    // General error response
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while updating the patient'
    });
  }
};

// Delete patient
// Assign/Update doctor for a patient
export const assignDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    // Validate patient ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
      });
    }

    // Validate doctor ID if provided
    if (doctorId && !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format',
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // If doctorId is provided, check if doctor exists
    if (doctorId) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }
    }

    const previousDoctorId = patient.assignedDoctor;
    
    // Update patient's assigned doctor
    patient.assignedDoctor = doctorId || null;
    await patient.save();

    // If there was a previous doctor, remove patient from their list
    if (previousDoctorId) {
      await Doctor.findByIdAndUpdate(
        previousDoctorId,
        { $pull: { patients: patient._id } }
      );
    }

    // If new doctor is assigned, add patient to their list
    if (doctorId) {
      await Doctor.findByIdAndUpdate(
        doctorId,
        { $addToSet: { patients: patient._id } },
        { new: true }
      );
    }

    // Get updated patient with doctor details
    const updatedPatient = await Patient.findById(id)
      .populate('assignedDoctor', 'name email specialization')
      .lean();

    res.status(200).json({
      success: true,
      message: doctorId ? 'Doctor assigned successfully' : 'Doctor unassigned successfully',
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Error in assignDoctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get recent patients for a specific doctor
export const getRecentPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 recent patients

    // Find appointments for this doctor, sorted by most recent
    const recentAppointments = await Appointment.find({ doctor: doctorId })
      .sort({ date: -1 })
      .limit(limit)
      .populate('patient', 'name email phone')
      .lean();

    // Extract unique patients
    const patientMap = new Map();
    recentAppointments.forEach(appt => {
      if (appt.patient && !patientMap.has(appt.patient._id.toString())) {
        patientMap.set(appt.patient._id.toString(), {
          ...appt.patient,
          lastVisit: appt.date
        });
      }
    });

    const recentPatients = Array.from(patientMap.values());

    res.status(200).json({
      success: true,
      count: recentPatients.length,
      data: recentPatients
    });
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent patients',
      error: error.message
    });
  }
};

export const deletePatient = async (req, res) => {
  try {
    // Find the patient and populate the assignedDoctor field
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // 1. Remove patient from doctor's patients array if assigned
    if (patient.assignedDoctor) {
      await Doctor.findByIdAndUpdate(
        patient.assignedDoctor._id,
        { $pull: { patients: patient._id } }
      );
    }
    
    // 2. Delete all appointments for this patient
    const { deletedCount: deletedAppointments } = await Appointment.deleteMany(
      { patient: patient._id }
    );
    
    // 3. Delete the patient
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!deletedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
      data: {
        patientId: deletedPatient._id,
        deletedAppointments
      },
    });
    
  } catch (error) {
    console.error('Error in deletePatient:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // General error response
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while deleting the patient'
    });
  }
};