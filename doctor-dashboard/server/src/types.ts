import { Document, Types } from 'mongoose';
import { Request } from 'express';
import { IDoctor as ModelIDoctor } from './models/Doctor';
import jwt from 'jsonwebtoken';

// Base interfaces
export interface BaseDoctor {
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  profilePicture?: string;
  patients: Types.ObjectId[];
  appointments: Types.ObjectId[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorRegistrationData {
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  isAdmin?: boolean;
}

// Use the model's IDoctor interface
export type IDoctor = ModelIDoctor;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload extends jwt.JwtPayload {
  id: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

declare global {
  namespace Express {
    interface Request {
      doctor?: IDoctor;
    }
  }
}
