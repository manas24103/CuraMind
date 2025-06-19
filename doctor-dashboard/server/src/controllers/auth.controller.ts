import { Request, Response, NextFunction } from 'express';
import Doctor, { IDoctor } from '../models/Doctor';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JwtPayload extends jwt.JwtPayload {
  id: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface IDoctorWithRole extends IDoctor {
  role: string;
  email: string;
  _id: Types.ObjectId;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl
    });

    const credentials = req.body as LoginCredentials;
    const { email, password } = credentials;

    // Validate input
    if (!email || !password) {
      console.warn('Login validation failed: Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    console.log(`Attempting login for email: ${email}`);

    // Find user by email
    const doctor = await Doctor.findOne({ email }).select('+password').exec();

    if (!doctor) {
      console.warn(`Login failed: No doctor found with email ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    console.log('Comparing passwords...');
    const isMatch = await doctor.comparePassword(password);
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
    
    // Create a properly typed payload without iat and exp
    // as they will be automatically added by jsonwebtoken
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = { 
      id: doctor._id.toString(),
      role: (doctor as any).role || 'doctor', // Assuming role exists, fallback to 'doctor'
      email: (doctor as any).email
    };
    
    console.log('JWT payload:', payload);
    
    // Sign the token with expiresIn option
    // This will automatically add iat (issued at) and exp (expiration) claims
    const token = jwt.sign(
      payload,
      secret,
      { expiresIn: '1d' } // Token expires in 1 day
    );
    
    console.log('JWT token will expire in 1 day');
    
    console.log('JWT token generated successfully');

    // Convert to plain object and remove sensitive fields
    const userObj = doctor.toObject();
    // Use a different variable name to avoid redeclaration
    const { password: pwd, __v, ...userData } = userObj as IDoctorWithRole;

    // Prepare response
    const responseData = {
      success: true,
      token,
      data: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        specialization: userData.specialization,
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

export const getDoctorDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The authenticate middleware should have already attached the doctor to the request
    if (!req.doctor) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }

    const doctor = await Doctor.findById(req.doctor._id)
      .select('-password -__v')
      .lean()
      .exec();

    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor details error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred while fetching doctor details' 
    });
  }
};
