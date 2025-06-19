// Custom type for UserRole
type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'NURSE' | 'PHARMACIST' | 'STAFF';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        [key: string]: any;
      };
      doctor?: {
        id: string;
        role: UserRole;
        [key: string]: any;
      };
    }
  }
}

export {};
