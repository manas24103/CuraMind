import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    diagnosis: { type: String },
    prescriptions: [{
        medicine: { type: String },
        dosage: { type: String },
        duration: { type: Number }
    }]
}, { _id: false });

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
}, { _id: false });

const patientSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'] 
    },
    age: { 
        type: Number, 
        required: [true, 'Age is required'],
        min: [0, 'Age cannot be negative']
    },
    gender: { 
        type: String, 
        required: [true, 'Gender is required'],
        enum: {
            values: ['male', 'female', 'other'],
            message: 'Gender must be either male, female, or other'
        }
    },
    medicalHistory: [medicalRecordSchema],
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'] 
    },
    address: {
        type: addressSchema,
        required: [true, 'Address is required']
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: false,
        default: null
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ 'address.city': 1 });
patientSchema.index({ 'address.state': 1 });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;