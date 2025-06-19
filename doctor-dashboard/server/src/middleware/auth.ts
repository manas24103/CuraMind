import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import Doctor from '../models/Doctor';
import { JwtPayload } from '../types';

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = req.doctor;
    if (!doctor || !doctor.isAdmin) {
      res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
      return;
    }
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during admin authorization' 
    });
  }
};

type AuthResponse = Response<{ success: boolean; error: string }>;

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: 'Authorization header missing or malformed' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ 
        success: false,
        error: 'Server configuration error' 
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      console.log('Decoded token:', decoded); // Debug log
      const doctor = await Doctor.findById(new Types.ObjectId(decoded.id));

      if (!doctor) {
        res.status(401).json({ 
          success: false,
          error: 'Doctor not found, unauthorized' 
        });
        return;
      }

      req.doctor = doctor.toObject();
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ 
          success: false,
          error: 'Token expired' 
        });
        return;
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