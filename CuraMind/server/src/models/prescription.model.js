import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

/**
 * @typedef {Object} IPrescription
 * @property {mongoose.Types.ObjectId} patientId - Reference to Patient
 * @property {mongoose.Types.ObjectId} doctorId - Reference to User (Doctor)
 * @property {string} symptoms - Patient's symptoms
 * @property {string} medicalHistory - Patient's medical history
 * @property {string} aiPrescription - AI-generated prescription
 * @property {string} doctorFinalPrescription - Final prescription by doctor
 * @property {boolean} isManual - Whether the prescription was manually created
 * @property {'pending' | 'completed' | 'cancelled'} status - Prescription status
 * @property {string} [feedback] - Optional feedback
 * @property {Date} createdAt - When the prescription was created
 * @property {Date} updatedAt - When the prescription was last updated
 * @extends {import('mongoose').Document}
 */

const PrescriptionSchema = new Schema(
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

const Prescription = model('Prescription', PrescriptionSchema);
export default Prescription;
