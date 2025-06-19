import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import bcrypt from 'bcryptjs';

export const createTestDoctor = async (req: Request, res: Response) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);

    const doctor = new Doctor({
      name: 'Test Doctor',
      email: 'test@example.com',
      password: hashedPassword,
      specialization: 'General Physician',
      experience: 5
    });

    await doctor.save();
    res.json({ message: 'Test doctor created successfully' });
  } catch (error) {
    console.error('❌ Test doctor creation error:', error);
    res.status(500).json({ message: 'Failed to create test doctor' });
  }
};
