import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

/**
 * @typedef {Object} Prescription
 * @property {string} medicine - The name of the medicine
 * @property {string} dosage - The dosage of the medicine
 * @property {number} duration - Duration of the prescription in days
 * @property {string} [instructions] - Optional instructions for the medicine
 */

const prescriptionSchema = new Schema({
  medicine: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: Number, required: true },
  instructions: { type: String, default: '' }
});

/**
 * @typedef {import('mongoose').Document} Document
 * @typedef {Object} MedicalHistory
 * @property {Date} date - Date of the medical record
 * @property {string} diagnosis - Diagnosis information
 * @property {Prescription[]} prescriptions - Array of prescriptions
 * @extends {Document}
 */

const medicalHistorySchema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  diagnosis: { type: String, required: true },
  prescriptions: [prescriptionSchema]
}, { _id: false });

export default model('MedicalHistory', medicalHistorySchema);
