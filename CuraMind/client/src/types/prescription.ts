// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface Prescription {
  _id: string;
  patientId: string | { _id: string; name: string; dateOfBirth?: string; gender?: string };
  doctorId: string | { _id: string; name: string; email: string };
  symptoms: string;
  medicalHistory: string;
  aiPrescription: string;
  doctorFinalPrescription: string;
  feedback?: string;
  isManual: boolean;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface PrescriptionFormData {
  patientId: string;
  symptoms: string;
  medicalHistory: string;
  prescription: string;
  useAI?: boolean;
  feedback?: string;
}

export interface AIPrescriptionResponse {
  success: boolean;
  data: {
    prescriptionId: string;
    aiPrescription: string;
  };
  message: string;
}

export interface PrescriptionResponse extends ApiResponse<Prescription> {}
export interface PrescriptionListResponse extends ApiResponse<Prescription[]> {}
// API Request/Response types
export interface GenerateAIPrescriptionRequest {
  patientId: string;
  symptoms: string;
  medicalHistory?: string;
}

export interface SavePrescriptionRequest {
  prescriptionId: string;
  finalPrescription: string;
  feedback?: string;
}

export interface CreateManualPrescriptionRequest {
  patientId: string;
  symptoms?: string;
  medicalHistory?: string;
  prescription: string;
}
