import mongoose, { Schema, model, Document, Types, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BaseDoctor } from '../types';

// Extend the base doctor interface with Mongoose document methods
export interface IDoctor extends Document, Omit<BaseDoctor, 'password'> {
  _id: Types.ObjectId;
  password: string; // Required in the document
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Define the Doctor document methods
interface IDoctorMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Define the Doctor model type
type DoctorModel = Model<IDoctor, {}, IDoctorMethods>;

const doctorSchema = new Schema<IDoctor, DoctorModel, IDoctorMethods>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    profilePicture: { type: String },
    patients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
    isAdmin: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
doctorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
doctorSchema.methods.generateAuthToken = function(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { 
      doctorId: this._id,
      isAdmin: this.isAdmin 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Create and export the model
const Doctor = (mongoose.models.Doctor as DoctorModel) || 
  model<IDoctor, DoctorModel>('Doctor', doctorSchema);

export { Doctor };
export type { DoctorModel };

export default Doctor;
