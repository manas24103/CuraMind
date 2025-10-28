import { Types } from 'mongoose';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';

// Get doctor dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    if (!Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doctor ID' 
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

    // Get appointments and prescriptions in parallel
    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ doctorId }),
      Prescription.find({ doctorId })
    ]);

    // Calculate statistics
    const stats = {
      totalAppointments: appointments.length,
      patientsSeen: new Set(appointments.map(a => a.patientId?.toString())).size,
      prescriptionsIssued: prescriptions.length,
      satisfactionScore: 4.9, // Placeholder for future implementation
      upcomingAppointments: appointments
        .filter(a => new Date(a.appointmentDate) > new Date())
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5), // Get next 5 appointments
      recentPrescriptions: prescriptions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5) // Get 5 most recent prescriptions
    };

    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard stats',
      error: error.message 
    });
  }
};
