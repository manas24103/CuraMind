import mongoose, { Document, Schema } from 'mongoose';

interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  symptoms: string;
  medicalHistory: string;
  aiPrescription: string;
  doctorFinalPrescription: string;
  isManual: boolean;
  status: 'pending' | 'completed' | 'cancelled';
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema: Schema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    medicalHistory: {
      type: String,
      required: true,
    },
    aiPrescription: {
      type: String,
      default: '',
    },
    doctorFinalPrescription: {
      type: String,
      required: true,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
