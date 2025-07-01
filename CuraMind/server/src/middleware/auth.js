import jwt from 'jsonwebtoken';
const { verify, TokenExpiredError } = jwt;
import { Types } from 'mongoose';
import Doctor from '../models/Doctor.js';

// Middleware to check if user is admin
export async function authorizeAdmin(req, res, next) {
  try {
    const doctor = req.doctor;
    if (!doctor || !doctor.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during admin authorization' 
    });
  }
}

// Authentication middleware to verify JWT token
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'No token, authorization denied' 
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid authorization format. Expected Bearer token' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error' 
      });
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      const doctor = await Doctor.findById(decoded.doctorId);

      if (!doctor) {
        return res.status(401).json({ 
          success: false,
          error: 'Doctor not found, unauthorized' 
        });
      }

      req.doctor = doctor.toObject();
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error instanceof TokenExpiredError) {
        return res.status(401).json({ 
          success: false,
          error: 'Token expired' 
        });
      }
      
      res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Unexpected error in authentication middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
}

