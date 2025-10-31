import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import Receptionist from '../models/Receptionist.js';

const userModels = {
  doctor: Doctor,
  admin: Admin,
  receptionist: Receptionist
};

// Verify token controller
export const verifyToken = (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: false,
        message: 'No user data found in request'
      });
    }

    // Return user data in the expected format
    const { _id, name, email, role } = req.user;
    
    const response = {
      success: true,
      user: {
        id: _id,
        name,
        email,
        role
      }
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    res.status(200).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
      console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl
    });

    const { email, password, userType = 'doctor' } = req.body;

    // Validate input
    if (!email || !password) {
      console.warn('Login validation failed: Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    const UserModel = userModels[userType];
    if (!UserModel) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be one of: ' + Object.keys(userModels).join(', ')
      });
    }

    let user;
    const emailQuery = email.toLowerCase().trim();
    
    if (userType === 'receptionist') {
      const query = {
        email: emailQuery,
        isActive: true
      };
      
      user = await UserModel.findOne(query)
        .select('+password')
        .setOptions({ sanitizeFilter: false })
        .exec();
    } else {
      const query = { email: emailQuery };
      
      user = await UserModel.findOne(query)
        .select('+password')
        .setOptions({ sanitizeFilter: false })
        .exec();
      
      const queryObj = UserModel.findOne(query).select('+password');
      
      user = await queryObj.exec();
      
      if (queryObj._mongooseOptions) {
        console.log('Final query options:', JSON.stringify(queryObj._mongooseOptions, null, 2));
      }
    }
    
    if (!user) {
      console.warn(`❌ Login failed: No ${userType} found with email ${email}`);
      const allUsers = await UserModel.find({}).select('email role -_id').lean();
      console.log('Available users in database:', JSON.stringify(allUsers, null, 2));
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      // Use the model's comparePassword method
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.warn(`❌ Login failed: Incorrect password for ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Error during password verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during authentication',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const errorMsg = 'JWT_SECRET is not configured';
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error',
        error: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      });
    }
    
    const payload = { 
      id: user._id.toString(),
      role: userType,
      email: user.email,
      name: user.name
    };
    
    // Generate token
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    
    // Remove password from user object
    user.password = undefined;
    
    // Prepare user data for response
    const userData = user.toObject();
    
    // Send response
    const responseData = {
      success: true,
      token,
      data: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userType,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    };
    
    return res.status(200).json(responseData);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
