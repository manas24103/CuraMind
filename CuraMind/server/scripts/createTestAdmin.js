import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../src/models/Admin.js';

// Load environment variables
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Test admin credentials
const testAdmin = {
  name: 'Test Admin',
  email: 'admin@example.com',
  password: '123456',
  permissions: ['read', 'write', 'delete', 'manage_users', 'manage_doctors', 'manage_receptionists']
};

async function createTestAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not defined in .env file');
      console.log('Please make sure your .env file in the server directory contains:');
      console.log('MONGO_URI=mongodb://your-mongodb-connection-string');
      process.exit(1);
    }
    
    console.log('MONGO_URI found. Connecting to database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    console.log('\nChecking for existing admin...');
    const existingAdmin = await Admin.findOne({ email: testAdmin.email });
    
    if (existingAdmin) {
      console.log('⚠️  Test admin already exists:');
      console.log(`   - ID: ${existingAdmin._id}`);
      console.log(`   - Name: ${existingAdmin.name}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log('\nTo reset the password, you need to delete the existing admin first.');
      console.log('Run this command in MongoDB shell:');
      console.log(`   use ${process.env.MONGO_URI.split('/').pop().split('?')[0]}`);
      console.log(`   db.admins.deleteOne({ email: "${testAdmin.email}" })`);
      process.exit(0);
    }

    // Create admin - let the model handle password hashing
    console.log('Creating admin user...');
    const admin = await Admin.create({
      name: testAdmin.name,
      email: testAdmin.email.toLowerCase(),
      password: testAdmin.password, // Let the pre-save hook handle hashing
      permissions: testAdmin.permissions,
      isActive: true
    });

    console.log('\n✅ Test admin created successfully!');
    console.log('\n==================================');
    console.log('ADMIN CREDENTIALS:');
    console.log('==================================');
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${testAdmin.password}`);
    console.log('==================================');
    console.log('\nIMPORTANT: Change this password after first login!');
    console.log('\nTo verify in MongoDB, run:');
    console.log(`   use ${process.env.MONGO_URI.split('/').pop().split('?')[0]}`);
    console.log('   db.admins.find().pretty()');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating test admin:');
    console.error(error.message);
    if (error.message.includes('E11000')) {
      console.error('\nError: Duplicate key error. An admin with this email already exists.');
    }
    console.error('\nMake sure:');
    console.error('1. MongoDB is running');
    console.error('2. MONGO_URI in .env is correct');
    console.error('3. The database is accessible');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
createTestAdmin();
