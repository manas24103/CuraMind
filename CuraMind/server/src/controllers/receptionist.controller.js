import Patient from '../models/patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { Types } from 'mongoose';

class ReceptionistController {
  async createPatient(req, res) {
    try {
      console.log("🟢 Received body:", req.body);
      
      // Handle both nested and direct request bodies
      const body = req.body.patient || req.body;
      
      const {
        name,
        email,
        phone,
        address,
        age,
        gender,
        bloodGroup,
        doctorId,
        medicalHistory,
      } = body;

      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Name and phone are required fields',
        });
      }

      // Only validate and assign doctor if provided
      let doctor;
      if (doctorId) {
        doctor = await Doctor.findById(doctorId);
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found',
          });
        }
      }

      const patient = new Patient({
        name,
        email,
        phone,
        address,
        age,
        gender,
        bloodGroup,
        ...(doctorId && { assignedDoctor: doctorId }),
        medicalHistory: medicalHistory || [],
      });

      await patient.save();
      if (doctor) {
        doctor.patients.push(patient._id);
        await doctor.save();
      }

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient,
      });
    } catch (error) {
      console.error('Error in createPatient:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = [];
        
        // Handle email validation error
        if (error.errors?.email?.kind === 'regexp') {
          messages.push('Please provide a valid email address (e.g., user@example.com)');
        }
        
        // Handle other validation errors
        if (error.errors) {
          for (const field in error.errors) {
            if (field !== 'email') { // Skip email as we handle it above
              messages.push(error.errors[field].message);
            }
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errors: messages.length > 0 ? messages : ['Invalid input data']
        });
      }
      
      // Handle duplicate key error (e.g., duplicate email)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A patient with this email already exists',
          field: 'email'
        });
      }
      
      // For other types of errors
      res.status(500).json({
        success: false,
        message: 'Error creating patient',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating the patient',
      });
    }
  }

  // Get all patients
  async getAllPatients(req, res) {
    try {
      if (!Patient) {
        console.error('Patient model is not defined');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error',
          details: 'Patient model not found',
          timestamp: new Date().toISOString()
        });
      }
      const patients = await Patient.find({})
        .populate({
          path: 'assignedDoctor',
          select: 'name specialization email',
          model: 'Doctor'
        })
        .select('-__v')
        .lean()
        .maxTimeMS(10000)
        .exec();
        
      // Debug log to check the populated data
      console.log('Patients with populated doctors:', JSON.stringify(patients, null, 2));
        
      return res.status(200).json({
        success: true,
        count: patients.length,
        data: patients,
      });
    } catch (error) {
      console.error('Error in getAllPatients:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error.errors && { mongoErrors: error.errors })
      });
      let errorMessage = 'Error fetching patients';
      let statusCode = 500;
      let errorDetails = {};
      
      if (error.name === 'CastError') {
        statusCode = 400;
        errorMessage = 'Invalid data format';
        errorDetails = { field: error.path, value: error.value };
      } else if (error.name === 'ValidationError') {
        statusCode = 400;
        errorMessage = 'Validation error';
        errorDetails = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
      } else if (error.name === 'MongoServerError' && error.code === 121) {
        errorMessage = 'Database validation failed';
        errorDetails = error.errInfo?.details || {};
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message,
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getPatientById(req, res) {
    try {
      const patient = await Patient.findById(req.params.id)
        .populate('assignedDoctor', 'name specialization')
        .select('-__v');
        
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patient',
        error: error.message,
      });
    }
  }

  // Delete a patient
  async deletePatient(req, res) {
    try {
      const { id } = req.params;
      
      // Find and delete the patient
      const patient = await Patient.findByIdAndDelete(id);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }
      
      // Remove patient from doctor's patients array
      if (patient.assignedDoctor) {
        await Doctor.findByIdAndUpdate(patient.assignedDoctor, {
          $pull: { patients: patient._id }
        });
      }
      
      // Delete all appointments for this patient
      await Appointment.deleteMany({ patient: patient._id });
      
      res.status(200).json({
        success: true,
        message: 'Patient deleted successfully',
      });
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting patient',
        error: error.message,
      });
    }
  }

  async getAllDoctors(req, res) {
    try {
      console.log('🔍 [Receptionist] Fetching all doctors...');
      
      // First, check if there are any doctors in the database
      const totalDoctors = await Doctor.countDocuments();
      console.log(`📊 [Receptionist] Total doctors in database: ${totalDoctors}`);
      
      // Fetch all doctors with minimal fields, but don't use lean() to ensure model methods work
      const doctors = await Doctor.find({})
        .select('name specialization email phone isActive')
        .sort({ name: 1 });
      
      console.log(`✅ [Receptionist] Found ${doctors.length} doctors`);
      
      // Log first few doctors for debugging
      if (doctors.length > 0) {
        console.log('📝 Sample doctors:', doctors.slice(0, 3).map(d => ({
          id: d._id || d.id,
          name: d.name,
          specialization: d.specialization,
          isActive: d.isActive
        })));
      }
      
      // Let Mongoose handle the toJSON transformation
      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
      
    } catch (error) {
      console.error('❌ [Receptionist] Error in getAllDoctors:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getAllAppointments(req, res) {
    try {
      const { startDate, endDate, status } = req.query;
      const filter = {};

      if (startDate || endDate) {
        filter.appointmentDate = {};
        if (startDate) {
          filter.appointmentDate.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.appointmentDate.$lte = end;
        }
      }

      if (status) {
        filter.status = status;
      }

      const appointments = await Appointment.find(filter)
        .populate('patient', 'name phone')
        .populate('doctor', 'name specialization')
        .sort({ appointmentDate: 1, startTime: 1 });

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      console.error('❌ Get appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error.message,
      });
    }
  }

  async createAppointment(req, res) {
    console.log('🔵 [Receptionist] createAppointment called with body:', req.body);
    
    try {
      const { patientId, doctorId, date, time, reason, status } = req.body;
      console.log('🔍 [Receptionist] Extracted data:', { 
        patientId, 
        doctorId, 
        date, 
        time, 
      });

      // Validate required fields
      if (!patientId || !doctorId || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID, doctor ID, date, and time are required',
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      // Check for existing appointment for this patient on the same date
      const appointmentDate = new Date(date);
      const startOfDay = new Date(appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const existingAppointment = await Appointment.findOne({
        patient: patientId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $ne: 'cancelled' } // Don't count cancelled appointments
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'Patient already has an appointment on this date',
          existingAppointment: {
            id: existingAppointment._id,
            date: existingAppointment.date,
            doctor: existingAppointment.doctor
          }
        });
      }

      // Create new appointment
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date: new Date(`${date}T${time}`),
        reason,
        status: 'scheduled',
      });

      await appointment.save();

      // Populate the appointment with patient and doctor details
      const savedAppointment = await Appointment.findById(appointment._id)
        .populate('patient', 'name email phone')
        .populate('doctor', 'name email specialization');
      doctor.appointments.push(appointment._id);
      await doctor.save();

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating appointment',
        error: error.message,
      });
    }
  }
  
  // Assign/Update doctor for a patient
  async assignDoctorToPatient(req, res) {
    try {
      const { id } = req.params;
      const { doctorId } = req.body;

      // Validate patient exists
      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Validate doctor exists if doctorId is provided
      let doctor = null;
      if (doctorId) {
        doctor = await Doctor.findById(doctorId);
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found',
          });
        }
      }

      // Remove patient from previous doctor's patients array if changing doctors
      if (patient.assignedDoctor && patient.assignedDoctor.toString() !== doctorId) {
        await Doctor.findByIdAndUpdate(patient.assignedDoctor, {
          $pull: { patients: patient._id }
        });
      }

      // Update the patient's assigned doctor
      patient.assignedDoctor = doctorId || null;
      await patient.save();

      // Add patient to new doctor's patients array if a new doctor is assigned
      if (doctorId && patient.assignedDoctor.toString() === doctorId) {
        await Doctor.findByIdAndUpdate(doctorId, {
          $addToSet: { patients: patient._id }
        });
      }

      // Populate the doctor details in the response
      const updatedPatient = await Patient.findById(id).populate('assignedDoctor', 'name email specialization');

      res.status(200).json({
        success: true,
        message: 'Doctor assignment updated successfully',
        data: updatedPatient,
      });
    } catch (error) {
      console.error('Error assigning doctor to patient:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update doctor assignment',
        error: error.message,
      });
    }
  }
}

export default new ReceptionistController();
