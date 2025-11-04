import jwt from 'jsonwebtoken';
const { verify, TokenExpiredError } = jwt;
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import Receptionist from '../models/Receptionist.js';

// Map of user types to their respective models
const userModels = {
  doctor: Doctor,
  admin: Admin,
  receptionist: Receptionist
};

// Middleware to verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
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
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded) {
        throw new Error('Invalid token');
      }
      
      // Get user type from token
      const userType = decoded.role || 'doctor';
      
      // Get the appropriate model based on user type
      const UserModel = userModels[userType];
      if (!UserModel) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user type in token'
        });
      }
      
      // Find user by ID
      const user = await UserModel.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Attach user to request object with proper role
      const userObj = user.toObject();
      userObj.role = userType;
      req.user = userObj;
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Session expired. Please log in again.' 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      
      console.error('Authentication error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Unexpected error in authentication middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

// Middleware to check if user has admin role
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    error: 'Admin access required' 
  });
};

// Middleware to check if user is a doctor
export const authorizeDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    error: 'Doctor access required' 
  });
};

// Middleware to check if user is a receptionist
export const authorizeReceptionist = (req, res, next) => {
  if (req.user && req.user.role === 'receptionist') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    error: 'Receptionist access required' 
  });
};

// Middleware to check if user has any of the specified roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};
