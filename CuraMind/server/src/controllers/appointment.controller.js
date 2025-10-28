import Appointment from '../models/Appointment.js';
import Patient from '../models/patient.js';

// Get all appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId });
    res.json({ 
      success: true, 
      data: appointments 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching doctor appointments', 
      error: error.message 
    });
  }
};

// Get specific appointment
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    res.json({ 
      success: true, 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching appointment', 
      error: error.message 
    });
  }
};

// Create appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();

    // Mark patient as active (has booked)
    if (appointment.patientId) {
      await Patient.findByIdAndUpdate(
        appointment.patientId, 
        { hasBookedAppointment: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error creating appointment', 
      error: error.message 
    });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Appointment updated successfully',
      data: appointment 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating appointment', 
      error: error.message 
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting appointment', 
      error: error.message 
    });
  }
};
