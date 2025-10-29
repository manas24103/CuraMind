import Doctor from '../models/Doctor.js';
import Receptionist from '../models/Receptionist.js';
import bcrypt from 'bcryptjs';

class AdminController {
  // Create a new doctor
  async createDoctor(req, res) {
    try {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // Destructure and validate required fields
      const { 
        name, 
        email, 
        password, 
        specialization, 
        phone, 
        experience,
        profilePicture, 
        role = 'doctor' 
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !specialization || experience === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields. Required: name, email, password, specialization, experience',
          received: { name: !!name, email: !!email, password: !!password, 
                     specialization: !!specialization, experience: experience !== undefined }
        });
      }

      // Debug log the experience field
      console.log('Raw experience value:', experience, 'Type:', typeof experience);
      
      // Convert experience to number and validate
      let experienceNum;
      try {
        // First try to convert to number
        experienceNum = Number(experience);
        
        // Explicitly check for NaN after conversion
        if (isNaN(experienceNum)) {
          throw new Error('Invalid number');
        }
        
        // Check if it's a whole number and non-negative
        if (!Number.isInteger(experienceNum) || experienceNum < 0) {
          throw new Error('Must be a non-negative integer');
        }
        
        console.log('Successfully converted experience to number:', experienceNum, 'Type:', typeof experienceNum);
        
      } catch (error) {
        console.error('Experience validation failed:', error.message);
        return res.status(400).json({
          success: false,
          message: `Invalid experience value: ${error.message}`,
          received: experience,
          expected: 'A non-negative integer number',
          type: typeof experience
        });
      }

      // Check if doctor already exists
      const doctorExists = await Doctor.findOne({ email });
      if (doctorExists) {
        return res.status(400).json({
          success: false,
          message: 'Doctor with this email already exists'
        });
      }

      // Create doctor with validated data - password will be hashed by pre-save hook
      const doctor = await Doctor.create({
        name,
        email,
        password, // Will be hashed by pre-save hook
        specialization,
        phone: phone || undefined,
        experience: experienceNum, // Explicitly set as number
        profilePicture: profilePicture || undefined,
        role
      });

      // Remove password from response
      const { password: _, ...doctorData } = doctor.toObject();

      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctorData
      });
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating doctor',
        error: error.message
      });
    }
  }

  // Create a new receptionist
  async createReceptionist(req, res) {
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
      console.error('Create receptionist error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating receptionist',
        error: error.message
      });
    }
  }

  // Delete a doctor
  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;

      const doctor = await Doctor.findByIdAndDelete(id);
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      res.json({
        success: true,
        message: 'Doctor deleted successfully'
      });
    } catch (error) {
      console.error('Delete doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting doctor',
        error: error.message
      });
    }
  }

  // Delete a receptionist
  async deleteReceptionist(req, res) {
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
      console.error('Delete receptionist error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting receptionist',
        error: error.message
      });
    }
  }

  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const doctors = await Doctor.find().select('-password');
      
      res.json({
        success: true,
        count: doctors.length,
        data: doctors
      });
    } catch (error) {
      console.error('Get all doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors',
        error: error.message
      });
    }
  }

  // Get all receptionists
  async getAllReceptionists(req, res) {
    try {
      const receptionists = await Receptionist.find().select('-password');
      
      res.json({
        success: true,
        count: receptionists.length,
        data: receptionists
      });
    } catch (error) {
      console.error('Get all receptionists error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching receptionists',
        error: error.message
      });
    }
  }
}

export default new AdminController();
