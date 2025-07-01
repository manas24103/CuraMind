import { Schema, model } from 'mongoose';

/**
 * @typedef {Object} IUser
 * @property {string} email - User's email address
 * @property {string} password - Hashed password
 * @property {string} name - User's full name
 * @property {'doctor' | 'patient'} role - User's role in the system
 * @property {Date} createdAt - When the user was created
 * @property {Date} updatedAt - When the user was last updated
 * @extends {import('mongoose').Document}
 */

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  }
}, {
  timestamps: true
});

const User = model('User', userSchema);
export default { User };
