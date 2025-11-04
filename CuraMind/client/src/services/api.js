import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Point directly to the backend server
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Check for both doctorToken and token for backward compatibility
    const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip handling for login requests to avoid noise
    if (error.config?.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    const { response } = error;
    
    // Handle network errors
    if (!response) {
      if (typeof toast !== 'undefined') {
        toast.error('Network error. Please check your connection and try again.');
      }
      return Promise.reject({
        message: 'Network error',
        details: error.message
      });
    }

    const { status, data } = response;
    const errorMessage = data?.message || 'An error occurred';

    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      // Don't show toast here, let the login component handle it
      return Promise.reject(error);
    }

    // For other errors, show a toast
    if (status !== 401 && typeof toast !== 'undefined') {
      try {
        toast.dismiss();
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (toastError) {
        // Silent error for toast
      }
    }

    // Return a clean error response
    return Promise.reject({
      message: errorMessage,
      response: data,
      status,
      config: {
        method: error.config?.method,
        url: error.config?.url
      }
    });
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  // Add other auth endpoints as needed
};

// Doctor API
export const doctorAPI = {
  // Admin only
  createDoctor: (data) => api.post('/doctors', data),
  getDoctors: () => api.get('/doctors'),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  
  // Doctor-specific
  getDoctorAppointments: (doctorId) => api.get(`/doctors/${doctorId}/appointments`),
  getDoctorPatients: (doctorId) => api.get(`/doctors/${doctorId}/patients`),
  getDashboardStats: (doctorId) => api.get(`/doctors/${doctorId}/stats`),
};

// Patient API
export const patientAPI = {
  // Admin and Receptionist only
  getPatients: () => api.get('/patients'),
  createPatient: (data) => api.post('/patients', data),
  
  // Accessible by patient, their doctor, admin, or receptionist
  getPatient: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  
  // Admin only
  deletePatient: (id) => api.delete(`/patients/${id}`),
};

// Appointment API
export const appointmentAPI = {
  // Admin and Receptionist only
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  createAppointment: (data) => api.post('/appointments', data),
  
  // Get single appointment
  getAppointment: (id) => api.get(`/appointments/${id}`),
  
  // Update appointment (admin and receptionist only)
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  
  // Delete appointment (admin only)
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  
  // Get doctor's appointments
  getDoctorAppointments: (doctorId, params = {}) => 
    api.get(`/doctors/${doctorId}/appointments`, { params }),
};

// Receptionist API
export const receptionistAPI = {
  // Admin only
  createReceptionist: (data) => api.post('/receptionists', data),
  getReceptionists: () => api.get('/receptionists'),
  getReceptionist: (id) => api.get(`/receptionists/${id}`),
  updateReceptionist: (id, data) => api.put(`/receptionists/${id}`, data),
  deleteReceptionist: (id) => api.delete(`/receptionists/${id}`),
  
  // Receptionist-specific endpoints
  assignDoctorToPatient: (patientId, doctorId) => 
    api.put(`/patients/${patientId}/assign-doctor`, { doctorId }),
};

// Prescription API
export const prescriptionAPI = {
  createPrescription: (data) => api.post('/prescriptions', data),
  // Add other prescription endpoints as needed
};

export default api;
