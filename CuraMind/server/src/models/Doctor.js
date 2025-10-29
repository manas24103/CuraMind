import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    profilePicture: { type: String },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
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
    next(error);
  }
});

// Method to compare password
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
doctorSchema.methods.generateAuthToken = function() {
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

// Add query middleware to log all find queries
doctorSchema.pre(/^find/, function(next) {
  console.log('Doctor query:', JSON.stringify(this.getQuery(), null, 2));
  console.log('Query options:', JSON.stringify(this.getOptions(), null, 2));
  next();
});

// Create and export the model
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;
