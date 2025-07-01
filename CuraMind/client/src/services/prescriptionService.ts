import axios, { AxiosError } from 'axios';
import { 
  GenerateAIPrescriptionRequest, 
  SavePrescriptionRequest, 
  CreateManualPrescriptionRequest,
  AIPrescriptionResponse,
  PrescriptionResponse,
  PrescriptionListResponse
} from '../types/prescription';

// Define a simple auth token getter if authService is not available
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// In development, the proxy will handle the API URL
// In production, this should be set to your production API URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || '/api')
  : '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

export interface Prescription {
  _id?: string;
  medicine: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export type MedicalRecordInput = Omit<MedicalRecord, '_id'>;

export interface MedicalRecord {
  _id?: string;
  date: string;
  diagnosis: string;
  prescriptions: Prescription[];
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Fetches a list of all patients
 * @returns Promise with an array of patients
 */
export const getPatients = async (): Promise<Patient[]> => {
  try {
    console.log('Fetching patients from:', API_URL + '/patients');
    const response = await api.get<ApiResponse<Patient[]>>('/patients');
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch patients');
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    };
    
    console.error('Error fetching patients:', errorDetails);
    
    // If we're in development, include more details in the error
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Failed to fetch patients: ${error.message} (${error.response?.status || 'no status'})`);
    }
    
    throw new Error('Failed to load patients. Please check your connection and try again.');
  }
};

/**
 * Fetches medical history for a specific patient
 * @param patientId - The ID of the patient
 * @returns Promise with an array of medical records
 */
export const getPatientMedicalHistory = async (patientId: string): Promise<MedicalRecord[]> => {
  try {
    const response = await api.get<ApiResponse<MedicalRecord[]>>(
      `/patients/${patientId}/medical-history`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch medical history');
  } catch (error) {
    console.error(`Error fetching medical history for patient ${patientId}:`, error);
    throw error;
  }
};

/**
 * Adds or updates a medical record for a patient
 * @param patientId - The ID of the patient
 * @param record - The medical record data (without _id for new records)
 * @returns Promise with the saved medical record
 */
export const addOrUpdateMedicalRecord = async (
  patientId: string,
  record: Omit<MedicalRecord, '_id'>
): Promise<MedicalRecord> => {
  try {
    const response = await api.post<ApiResponse<MedicalRecord>>('/prescriptions', {
      patientId,
      ...record,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to save medical record');
  } catch (error) {
    console.error('Error saving medical record:', error);
    throw error;
  }
};

/**
 * Generate AI prescription (creates a draft)
 * @param data - The prescription generation request data
 * @returns Promise with the AI-generated prescription and draft ID
 */
export const generateAIPrescription = async (
  data: GenerateAIPrescriptionRequest
): Promise<AIPrescriptionResponse> => {
  try {
    const response = await api.post<AIPrescriptionResponse>('/prescriptions/generate', data);
    return response.data;
  } catch (error) {
    console.error('Error generating AI prescription:', error);
    throw error;
  }
};

/**
 * Save final prescription (updates draft or creates final version)
 * @param data - The prescription save request data
 * @returns Promise with the saved prescription
 */
export const savePrescription = async (
  data: SavePrescriptionRequest
): Promise<PrescriptionResponse> => {
  try {
    const { prescriptionId, ...rest } = data;
    const response = await api.put<PrescriptionResponse>(
      `/prescriptions/${prescriptionId}`,
      rest
    );
    return response.data;
  } catch (error) {
    console.error('Error saving prescription:', error);
    throw error;
  }
};

/**
 * Create manual prescription (direct entry by doctor)
 * @param data - The manual prescription data
 * @returns Promise with the created prescription
 */
export const createManualPrescription = async (
  data: CreateManualPrescriptionRequest
): Promise<PrescriptionResponse> => {
  try {
    const response = await api.post<PrescriptionResponse>('/prescriptions/manual', data);
    return response.data;
  } catch (error) {
    console.error('Error creating manual prescription:', error);
    throw error;
  }
};

/**
 * Get all prescriptions for a patient
 * @param patientId - The ID of the patient
 * @returns Promise with the list of prescriptions
 */
export const getPatientPrescriptions = async (
  patientId: string
): Promise<PrescriptionListResponse> => {
  try {
    const response = await api.get<PrescriptionListResponse>(
      `/prescriptions/patient/${patientId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    throw error;
  }
};

/**
 * Get a specific prescription by ID
 * @param prescriptionId - The ID of the prescription
 * @returns Promise with the prescription details
 */
export const getPrescriptionById = async (
  prescriptionId: string
): Promise<PrescriptionResponse> => {
  try {
    const response = await api.get<PrescriptionResponse>(
      `/prescriptions/${prescriptionId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching prescription:', error);
    throw error;
  }
};
