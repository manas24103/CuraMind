import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Doctor } from '../types/doctor';
import { User } from '../types/user';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  specialization?: string;
  experience?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  data?: any;
  error?: string;
}

interface AxiosErrorWithResponse extends AxiosError {
  response?: AxiosResponse<ApiErrorResponse>;
}

const API_URL = 'http://localhost:5000/api';

// Define the interface that extends AxiosInstance with our custom methods
export interface ApiClient extends AxiosInstance {
  // Authentication
  login: (credentials: { email: string; password: string }) => Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>>;
  register: (data: RegisterData) => Promise<AxiosResponse<ApiResponse<User>>>;
  getCurrentUser: () => Promise<AxiosResponse<ApiResponse<User>>>;
  
  // Doctor Profile
  getDoctorProfile: () => Promise<AxiosResponse<ApiResponse<Doctor>>>;
  updateDoctorProfile: (data: Partial<Doctor>) => Promise<AxiosResponse<ApiResponse<Doctor>>>;
  
  // Doctor Management
  getAllDoctors: () => Promise<AxiosResponse<ApiResponse<Doctor[]>>>;
  deleteDoctor: (id: string) => Promise<AxiosResponse<ApiResponse<void>>>;
  
  // Patients
  getPatients: () => Promise<AxiosResponse<ApiResponse<any[]>>>;
  getPatient: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createPatient: (data: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updatePatient: (id: string, data: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  
  // Appointments
  getAppointments: () => Promise<AxiosResponse<ApiResponse<any[]>>>;
  createAppointment: (data: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateAppointment: (id: string, data: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteAppointment: (id: string) => Promise<AxiosResponse<ApiResponse<void>>>;
  
  // AI Prescription
  generatePrescription: (symptoms: string, medicalHistory: string) => Promise<AxiosResponse<ApiResponse<{ prescription: string }>>>;
  validatePrescription: (prescription: string) => Promise<AxiosResponse<ApiResponse<{ valid: boolean; issues?: string[] }>>>;
}

// Create the axios instance with the correct type
const createApiClient = (): ApiClient => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true, // Important for sending cookies with CORS
    timeout: 15000, // Increased timeout to 15 seconds
  }) as unknown as ApiClient;

  // Add request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses
      console.debug('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error: AxiosErrorWithResponse) => {
      // Enhanced error logging
      const errorDetails = {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        responseData: error.response?.data,
        config: {
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
          withCredentials: error.config?.withCredentials
        }
      };
      
      console.error('API Error Details:', JSON.stringify(errorDetails, null, 2));

      // Handle CORS errors
      if (error.message === 'Network Error' && !error.response) {
        console.error('CORS/Network Error - Check if the server is running and CORS is properly configured');
        return Promise.reject({
          status: 0,
          message: 'Network Error: Unable to connect to the server. Please check your connection and try again.',
          isNetworkError: true
        });
      }

      // Handle timeouts
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          status: 408,
          message: 'Request timeout. Please check your connection and try again.',
          isTimeout: true
        });
      }

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        console.log('Authentication required - redirecting to login');
        localStorage.removeItem('token');
        // Only redirect if not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        return Promise.reject({
          status: 403,
          message: 'You do not have permission to perform this action.',
          isForbidden: true
        });
      }

      // Handle 404 Not Found
      if (error.response?.status === 404) {
        return Promise.reject({
          status: 404,
          message: 'The requested resource was not found.',
          isNotFound: true
        });
      }

      // Handle 500 Internal Server Error
      if (error.response?.status === 500) {
        return Promise.reject({
          status: 500,
          message: 'An internal server error occurred. Please try again later.',
          isServerError: true
        });
      }

      // For other errors, provide a user-friendly message
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An unexpected error occurred. Please try again.';

      return Promise.reject({
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data,
        config: error.config
      });
    }
  );

  // Add custom methods
  instance.login = function(credentials: { email: string; password: string }) {
    return instance.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
  };

  instance.register = function(data: any) {
    return instance.post<ApiResponse>('/auth/register', data);
  };

  // Doctor Profile
  instance.getDoctorProfile = function() {
    return instance.get<ApiResponse<Doctor>>('/auth/me');
  };

  instance.updateDoctorProfile = function(data: Partial<Doctor>) {
    return instance.put<ApiResponse<Doctor>>('/doctors/me', data);
  };

  // Doctor Management
  instance.getAllDoctors = function() {
    return instance.get<ApiResponse<Doctor[]>>('/doctors');
  };

  instance.deleteDoctor = function(id: string) {
    return instance.delete<ApiResponse<void>>(`/doctors/${id}`);
  };

  // Patients
  instance.getPatients = function() {
    return instance.get<ApiResponse<any[]>>('/patients');
  };

  instance.getPatient = function(id: string) {
    return instance.get<ApiResponse<any>>(`/patients/${id}`);
  };

  instance.createPatient = function(data: any) {
    return instance.post<ApiResponse>('/patients', data);
  };

  instance.updatePatient = function(id: string, data: any) {
    return instance.put<ApiResponse>(`/patients/${id}`, data);
  };

  // Appointments
  instance.getAppointments = function() {
    return instance.get<ApiResponse<any[]>>('/appointments');
  };

  instance.createAppointment = function(data: any) {
    return instance.post<ApiResponse>('/appointments', data);
  };

  instance.updateAppointment = function(id: string, data: any) {
    return instance.put<ApiResponse>(`/appointments/${id}`, data);
  };

  instance.deleteAppointment = function(id: string) {
    return instance.delete<ApiResponse>(`/appointments/${id}`);
  };

  // AI Prescription
  instance.generatePrescription = function(symptoms: string, medicalHistory: string) {
    return instance.post<ApiResponse<{ prescription: string }>>('/ai/generate-prescription', { 
      symptoms, 
      medicalHistory 
    });
  };

  instance.validatePrescription = function(prescription: string) {
    return instance.post<ApiResponse<{ valid: boolean; issues?: string[] }>>(
      '/ai/validate-prescription', 
      { prescription }
    );
  };

  return instance;
};

const apiService = createApiClient();

export default apiService;
