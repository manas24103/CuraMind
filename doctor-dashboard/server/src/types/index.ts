import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { IDoctor } from '../types';

export interface DoctorRegistrationData {
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
}

export interface DoctorDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  profilePicture?: string;
  patients: Types.ObjectId[];
  appointments: Types.ObjectId[];
  isAdmin: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorRequest extends Request {
  doctorId?: string;
  doctor?: IDoctor;
}
