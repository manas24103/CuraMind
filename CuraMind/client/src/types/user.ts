export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'doctor' | 'patient';
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
