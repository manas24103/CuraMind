import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import Doctor from '../models/Doctor';
import { IDoctor, JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      doctor?: IDoctor;
    }
  }
}

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = req.doctor;
    if (!doctor || !doctor.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(403).json({ error: 'Admin access required' });
  }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    res.status(401).json({ error: 'No token, authorization denied' });
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Invalid authorization format. Expected Bearer token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log('Decoded token:', decoded); // Debug log
    const doctor = await Doctor.findById(new Types.ObjectId(decoded.id));

    if (!doctor) {
      res.status(401).json({ message: 'Not authorized, doctor not found' });
      return;
    }

    req.doctor = doctor.toObject();
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
