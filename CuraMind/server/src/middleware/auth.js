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
export const authenticate = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

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
        // Verify token
        const decoded = verify(token, process.env.JWT_SECRET);
        
        // Get user type from token
        const userType = decoded.role || 'doctor';
        
        // Check if the user has the required role
        if (requiredRole && userType !== requiredRole) {
          return res.status(403).json({
            success: false,
            error: `Access denied. ${requiredRole} role required.`
          });
        }
        
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
            error: 'User not found, unauthorized' 
          });
        }

        // Attach user to request object
        req.user = user.toObject();
        req.user.role = userType;
        
        next();
      } catch (error) {
        console.error('Token verification error:', error);
        
        if (error instanceof TokenExpiredError) {
          return res.status(401).json({ 
            success: false,
            error: 'Token expired' 
          });
        }
        
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token' 
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
        error: `Role (${req.user.role}) is not allowed to access this resource`
      });
    }
    
    return next();
  };
};

