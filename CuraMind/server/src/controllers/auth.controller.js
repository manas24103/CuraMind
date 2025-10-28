import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import Receptionist from '../models/Receptionist.js';

const userModels = {
  doctor: Doctor,
  admin: Admin,
  receptionist: Receptionist
};

export const login = async (req, res, next) => {
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
    
    console.log(`Attempting login for ${userType} with email: ${email}`);

    // Get the appropriate model based on user type
    const UserModel = userModels[userType];
    if (!UserModel) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email }).select('+password').exec();

    if (!user) {
      console.warn(`Login failed: No ${userType} found with email ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.warn(`Login failed: Incorrect password for ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('Password verified successfully');

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const errorMsg = 'JWT_SECRET is not configured';
      console.error(errorMsg);
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error',
        error: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      });
    }

    console.log('Generating JWT token...');
    
    // Create payload with user type
    const payload = { 
      id: user._id.toString(),
      role: userType,
      email: user.email,
      name: user.name
    };
    
    console.log('JWT payload:', payload);
    
    // Sign the token with expiresIn option
    const token = jwt.sign(
      payload,
      secret,
      { expiresIn: '1d' } // Token expires in 1 day
    );
    
    console.log('JWT token will expire in 1 day');
    console.log('JWT token generated successfully');

    // Convert to plain object and remove sensitive fields
    const userObj = user.toObject();
    const { password: pwd, __v, ...userData } = userObj;

    // Prepare response based on user type
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
      },
      expiresIn: '1d',
      timestamp: new Date().toISOString()
    };
    
    console.log('Login successful for user:', responseData.data.email);
    console.log('Login response data:', responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred during login' 
    });
  }
};
