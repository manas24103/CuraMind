import { User } from './user';

export interface Appointment {
  _id: string;
  doctor: string | User;
  patient: string | User;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  type?: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'other';
  reason?: string;
  symptoms?: string[];
  diagnosis?: string;
  notes?: string;
  prescription?: Prescription;
  duration?: number; // in minutes
  createdAt: string;
  updatedAt: string;
  startTime?: string; // ISO string
  endTime?: string;   // ISO string
  isPaid?: boolean;
  paymentId?: string;
  meetingLink?: string;
  attachments?: {
    name: string;
    url: string;
    type: string; // 'image' | 'pdf' | 'document' | 'other'
    uploadedAt: string;
  }[];
  followUpDate?: string;
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    occurrences?: number;
  };
  parentAppointment?: string; // For recurring appointments
  cancellationReason?: string;
  cancelledBy?: string | User;
  cancellationDate?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  rating?: {
    score: number;
    review?: string;
    date: string;
  };
}

export interface Prescription {
  _id?: string;
  doctor: string | User;
  patient: string | User;
  appointment: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions?: string;
  notes?: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isAIEnhanced?: boolean;
  aiSuggestions?: string[];
  status?: 'active' | 'completed' | 'cancelled';
  refillsAllowed?: number;
  refillsRemaining?: number;
  validityPeriod?: number; // in days
  signature?: {
    doctorName: string;
    licenseNumber: string;
    signatureUrl?: string;
    signedAt: string;
  };
  pharmacyNotes?: string;
  isElectronic?: boolean;
  barcode?: string;
  qrCode?: string;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  withFood?: boolean;
  beforeSleep?: boolean;
  asNeeded?: boolean;
  quantity?: number;
  refills?: number;
  route?: 'oral' | 'topical' | 'inhalation' | 'injection' | 'other';
  form?: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'other';
  strength?: string;
  genericName?: string;
  brandName?: string;
  sideEffects?: string[];
  precautions?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
