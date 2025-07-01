import Appointment from '../models/Appointment.js';

// Get all appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor appointments', error });
  }
};

// Get specific appointment
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error });
  }
};

// Create appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating appointment', error });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
};
