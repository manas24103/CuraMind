import Appointment from '../models/Appointment.js';
import Patient from '../models/patient.js';
import Doctor from '../models/Doctor.js';

// Get all appointments with optional filtering
export const getAllAppointments = async (req, res) => {
  try {
    const { startDate, endDate, status, doctorId, patientId } = req.query;
    const filter = {};

    // Date range filtering
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

    // Additional filters
    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;

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
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

// Get single appointment by ID
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name specialization email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, reason, status = 'scheduled' } = req.body;

    // Log the incoming request body for debugging
    console.log('Request body:', req.body);

    // Validate required fields
    if (!patient || !doctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Patient, doctor, date, and time are required',
        received: { patient, doctor, date, time }
      });
    }

    // Check if patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
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
      patient: patient,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' }
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
    
    // Ensure time is properly formatted (HH:MM)
    const [hours, minutes] = time.split(':');
    if (hours && minutes) {
      appointmentDate.setHours(parseInt(hours, 10));
      appointmentDate.setMinutes(parseInt(minutes, 10));
    }

    const newAppointment = new Appointment({
      patient,
      doctor,
      date: appointmentDate,
      time: time, // Store the time string as is
      reason: reason || 'General Checkup',
      status: status || 'scheduled'
    });
    
    console.log('Creating appointment with data:', {
      patient,
      doctor,
      date: appointmentDate,
      time,
      reason: reason || 'General Checkup',
      status: status || 'scheduled'
    });

    const savedAppointment = await newAppointment.save();

    // Add appointment to doctor's appointments
    if (doctorExists) {
      doctorExists.appointments.push(savedAppointment._id);
      await doctorExists.save();
    }

    // Populate the appointment details for response
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message,
    });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If date or time is being updated, handle date formatting
    if (updateData.date && updateData.time) {
      updateData.date = new Date(`${updateData.date}T${updateData.time}`);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message,
    });
  }
};

// Delete appointment
// Get appointments for a specific doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    const filter = { doctor: doctorId };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Add date range filter if provided
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
    
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor appointments',
      error: error.message,
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Remove appointment from doctor's appointments array
    await Doctor.findByIdAndUpdate(appointment.doctor, {
      $pull: { appointments: appointment._id }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message,
    });
  }
};