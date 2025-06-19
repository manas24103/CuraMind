import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    medicalHistory: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const patientSchema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { 
        type: String, 
        required: true,
        enum: ['male', 'female', 'other'] 
    },
    medicalHistory: { type: String },
    email: { 
        type: String, 
        required: true,
        unique: true 
    },
    phone: { type: String, required: true },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    }
}, {
    timestamps: true
});

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);
