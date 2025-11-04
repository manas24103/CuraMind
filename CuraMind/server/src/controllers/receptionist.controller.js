import Receptionist from '../models/Receptionist.js';
import Patient from '../models/patient.js';

// Get all receptionists
export const getAllReceptionists = async (req, res) => {
    try {
      const receptionists = await Receptionist.find().select('-password');
      
      res.json({
        success: true,
        count: receptionists.length,
        data: receptionists
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching receptionists',
        error: error.message
      });
    }
  }

// Delete a receptionist
export const deleteReceptionist = async (req, res) => {
    try {
      const { id } = req.params;

      const receptionist = await Receptionist.findByIdAndDelete(id);
      
      if (!receptionist) {
        return res.status(404).json({
          success: false,
          message: 'Receptionist not found'
        });
      }

      res.json({
        success: true,
        message: 'Receptionist deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting receptionist',
        error: error.message
      });
    }
  }
// Get a single receptionist by ID
export const getReceptionistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const receptionist = await Receptionist.findById(id).select('-password');
    
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    res.json({
      success: true,
      data: receptionist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching receptionist',
      error: error.message
    });
  }
};

// Update a receptionist
export const updateReceptionist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating password through this endpoint
    if (updates.password) {
      delete updates.password;
    }

    const receptionist = await Receptionist.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    res.json({
      success: true,
      message: 'Receptionist updated successfully',
      data: receptionist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating receptionist',
      error: error.message
    });
  }
};

// Create a new receptionist
export const createReceptionist = async (req, res) => {
    try {
      const { name, email, password, phone, role = 'receptionist' } = req.body;

      // Check if receptionist already exists
      const receptionistExists = await Receptionist.findOne({ email });
      if (receptionistExists) {
        return res.status(400).json({
          success: false,
          message: 'Receptionist with this email already exists'
        });
      }

      // Create receptionist - password will be hashed by pre-save hook
      const receptionist = await Receptionist.create({
        name,
        email,
        password, // Will be hashed by pre-save hook
        phone,
        role
      });

      // Remove password from response
      const { password: _, ...receptionistData } = receptionist.toObject();

      res.status(201).json({
        success: true,
        message: 'Receptionist created successfully',
        data: receptionistData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating receptionist',
        error: error.message
      });
    }
  }
// Assign a doctor to a patient
export const assignDoctorToPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    // Find and update the patient with the assigned doctor
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { assignedDoctor: doctorId },
      { new: true, runValidators: true }
    ).populate('assignedDoctor', 'name email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor assigned to patient successfully',
      data: patient
    });
  } catch (error) {
    console.error('Error assigning doctor to patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning doctor to patient',
      error: error.message
    });
  }
};
