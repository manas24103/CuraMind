import mongoose, { Schema } from 'mongoose';

const patientSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  medicalHistory: [{
    date: { type: Date, required: true },
    diagnosis: { type: String },
    prescriptions: [{
      medicine: { type: String },
      dosage: { type: String },
      duration: { type: Number }
    }]
  }],
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }]
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
