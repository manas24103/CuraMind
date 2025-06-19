import { Types } from 'mongoose';
import { IDoctor } from '../models/Doctor';

declare global {
  namespace Express {
    interface Request {
      doctor?: IDoctor & { _id: Types.ObjectId };
    }
  }
}

export {};
