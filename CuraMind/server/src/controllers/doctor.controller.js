import { Types } from 'mongoose';
import Doctor from '../models/Doctor.js';

export class DoctorController {
  // Get current authenticated doctor's profile
  async getDoctor(req, res) {
    try {
      const doctor = req.doctor;
      if (!doctor) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      
      res.json({ success: true, data: doctor });
    } catch (error) {
      console.error('Get doctor error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch doctor' });
    }
  }

  // Get all doctors (admin only)
  async getAllDoctors(req, res) {
    try {
      const doctors = await Doctor.find({}).select('-password');
      res.status(200).json({ success: true, data: doctors });
    } catch (error) {
      console.error('Get all doctors error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
  }

  // Get doctor by ID (admin or self)
  async getDoctorById(req, res) {
    try {
      const { id } = req.params;
      
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid doctor ID' });
        return;
      }

      const doctor = await Doctor.findById(id).select('-password');
      if (!doctor) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }

      res.status(200).json({ success: true, data: doctor });
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch doctor' });
    }
  }

  // Create a new doctor (admin only)
  async createDoctor(req, res) {
    try {
      const { name, email, password, specialization, experience, isAdmin } = req.body;
      
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        res.status(400).json({ 
          success: false, 
          error: 'Doctor with this email already exists' 
        });
        return;
      }

      const doctor = new Doctor({ 
        name, 
        email, 
        password, 
        specialization, 
        experience, 
        isAdmin: isAdmin || false 
      });
      
      await doctor.save();
      const { password: _, ...doctorData } = doctor.toObject();
      
      res.status(201).json({ success: true, data: doctorData });
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(500).json({ success: false, error: 'Failed to create doctor' });
    }
  }

  // Update doctor by ID (admin or self for non-admin fields)
  async updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const currentDoctor = req.doctor;

      if (!currentDoctor) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid doctor ID' });
        return;
      }

      const doctorToUpdate = await Doctor.findById(id);
      if (!doctorToUpdate) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }

      // Check if the current user is the doctor being updated or an admin
      const isSelf = currentDoctor._id.toString() === id;
      const isAdmin = currentDoctor.isAdmin;

      if (!isAdmin && !isSelf) {
        res.status(403).json({ 
          success: false, 
          error: 'Not authorized to update this doctor' 
        });
        return;
      }

      // Non-admin users can't update admin status
      if (!isAdmin && 'isAdmin' in updates) {
        res.status(403).json({ 
          success: false, 
          error: 'Not authorized to update admin status' 
        });
        return;
      }

      // Update fields
      Object.assign(doctorToUpdate, updates);
      await doctorToUpdate.save();

      // Return updated doctor (without password)
      const { password: _, ...doctorData } = doctorToUpdate.toObject();
      
      res.status(200).json({ success: true, data: doctorData });
    } catch (error) {
      console.error('Update doctor error:', error);
      res.status(500).json({ success: false, error: 'Failed to update doctor' });
    }
  }

  // Delete doctor (admin only)
  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;
      const currentDoctor = req.doctor;

      if (!currentDoctor) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      if (!currentDoctor.isAdmin) {
        res.status(403).json({ 
          success: false, 
          error: 'Admin access required' 
        });
        return;
      }

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid doctor ID' });
        return;
      }

      // Prevent deleting self
      if (currentDoctor._id.toString() === id) {
        res.status(400).json({ 
          success: false, 
          error: 'Cannot delete your own account' 
        });
        return;
      }

      const doctor = await Doctor.findByIdAndDelete(id);
      if (!doctor) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: { id: doctor._id }
      });
    } catch (error) {
      console.error('Delete doctor error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete doctor' });
    }
  }

  // Update current doctor's profile
  async updateProfile(req, res) {
    try {
      if (!req.doctor) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      const updates = req.body;
      const doctor = await Doctor.findById(req.doctor._id);
      
      if (!doctor) {
        res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
        return;
      }

      // Update fields
      Object.assign(doctor, updates);
      await doctor.save();

      // Return updated doctor (without password)
      const { password: _, ...doctorData } = doctor.toObject();
      
      res.status(200).json({
        success: true,
        data: doctorData
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }
}

export default DoctorController;
