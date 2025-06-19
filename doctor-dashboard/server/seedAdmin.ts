import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { Doctor } from './src/models/Doctor';

async function seed() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctor-dashboard';
    console.log('Attempting to connect to MongoDB at:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Doctor.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new Doctor({
      name: 'Admin Doctor',
      email: 'admin@example.com',
      password: hashedPassword,
      specialization: 'Administration',
      experience: 10,
      isAdmin: true,
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
