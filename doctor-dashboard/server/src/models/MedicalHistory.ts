import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription {
  medicine: string;
  dosage: string;
  duration: number;
  instructions?: string;
}

export interface IMedicalHistory extends Document {
  date: Date;
  diagnosis: string;
  prescriptions: IPrescription[];
}

const prescriptionSchema = new Schema({
  medicine: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: Number, required: true },
  instructions: { type: String, default: '' }
});

const medicalHistorySchema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  diagnosis: { type: String, required: true },
  prescriptions: [prescriptionSchema]
}, { _id: false });

export default mongoose.model<IMedicalHistory>('MedicalHistory', medicalHistorySchema);
