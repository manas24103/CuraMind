import { Types } from 'mongoose';

// Extend the Express Request type to include the doctor property
declare global {
  namespace Express {
    interface Request {
      doctor?: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        role: string;
        // Add other doctor properties as needed
      };
    }
  }
}
