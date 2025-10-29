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
    console.log('Verify token controller called with user:', req.user);
    
    // If middleware passed, token is valid
    if (!req.user) {
      console.warn('No user data found in verifyToken');
      return res.status(200).json({
        success: false,
        message: 'No user data found in request'
      });
    }

    // Return user data in the expected format
    const { _id, name, email, role } = req.user;
    
    console.log('Token verified successfully for user:', { _id, email, role });
    
    const response = {
      success: true,
      user: {
        id: _id,
        name,
        email,
        role
      }
    };
    
    console.log('Sending verify-token response:', JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Token verification error in controller:', error);
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
    
    console.log(`Attempting login for ${userType} with email: ${email}`);

    // Get the appropriate model based on user type
    const UserModel = userModels[userType];
    if (!UserModel) {
      console.error(`Invalid user type specified: ${userType}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be one of: ' + Object.keys(userModels).join(', ')
      });
    }

    // Find user by email
    console.log(`\n=== Login Attempt ===`);
    console.log(`Searching for ${userType} with email:`, email);
    
    // Add additional query conditions based on user type
    const query = { email: email.toLowerCase().trim() };
    
    // For doctor/receptionist, make sure the account is active
    if (userType !== 'admin') {
      query.isActive = true;
    }
    
    console.log('Querying database with:', { model: userType, query });
    
    const user = await UserModel.findOne(query).select('+password').exec();
    
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
    
    console.log(`✅ Found user:`, { 
      id: user._id, 
      email: user.email,
      hasPassword: !!user.password,
      userType: user.role || userType
    });

    // Check if password matches
    console.log('\n🔑 Password Verification');
    console.log('---------------------');
    console.log('Input password length:', password ? '***' : 'MISSING');
    console.log('Stored password hash exists:', !!user.password);
    
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
    
    console.log('✅ Password verified successfully');
    
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
    
    console.log('Login successful for user:', responseData.data.email);
    console.log('Login response data:', responseData);
    
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('❌ Error during login process:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
