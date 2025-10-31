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
    const token = localStorage.getItem('token');
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
  login: (credentials) => api.post('/auth/login', credentials)
};

// Admin API
export const adminAPI = {
  // Doctors
  createDoctor: (data) => api.post('/admin/doctors', data),
  getDoctors: () => api.get('/admin/doctors'),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  
  // Receptionists
  createReceptionist: (data) => api.post('/admin/receptionists', data),
  getReceptionists: () => api.get('/admin/receptionists'),
  deleteReceptionist: (id) => api.delete(`/admin/receptionists/${id}`)
};

// Doctor API
export const doctorAPI = {
  getDoctors: () => api.get('/doctors'),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getDashboardStats: (doctorId) => api.get(`/doctors/${doctorId}/stats`),
  getProfile: () => api.get('/doctors/me'),
  updateProfile: (data) => api.put('/doctors/me', data),
  getDoctorAppointments: (doctorId) => api.get(`/doctors/${doctorId}/appointments`),
  getDoctorPatients: (doctorId) => api.get(`/doctors/${doctorId}/patients`)
};

// Appointment API
export const appointmentAPI = {
  getAppointments: () => api.get('/appointments'),
  createAppointment: (data) => api.post('/appointments', data),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getDoctorAppointments: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  getPatientAppointments: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getUpcomingAppointments: () => api.get('/appointments/upcoming'),
  getAppointmentsByDate: (date) => api.get(`/appointments/date/${date}`)
};

// Patient API
export const patientAPI = {
  getPatients: () => api.get('/patients'),
  createPatient: (data) => api.post('/patients', data),
  getPatient: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`)
};

// Prescription API
export const prescriptionAPI = {
  createPrescription: (data) => api.post('/prescriptions', data),
  getPatientPrescriptions: (patientId) => api.get(`/patients/${patientId}/prescriptions`),
  getDoctorPrescriptions: (doctorId) => api.get(`/doctors/${doctorId}/prescriptions`),
};

// Receptionist API
export const receptionistAPI = {
  // Patient management
  getPatients: async () => {
    try {
      const response = await api.get('/receptionist/patients');
      console.log('getPatients response:', response);
      // Handle both response structures: response.data.data and response.data
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error in getPatients:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  createPatient: (data) => api.post('/receptionist/patients', data),
  getPatient: (id) => api.get(`/receptionist/patients/${id}`),
  
  // Doctor management
  getDoctors: async () => {
    try {
      console.log('Initiating doctors fetch from /receptionist/doctors');
      const response = await api.get('/receptionist/doctors');
      
      console.log('Raw doctors API response:', {
        status: response.status,
        data: response.data,
        isDataArray: Array.isArray(response.data),
        hasDataProperty: 'data' in response.data,
        dataKeys: Object.keys(response.data || {})
      });
      
      // Handle different response formats
      let doctors = [];
      
      // If response.data is an array, use it directly
      if (Array.isArray(response.data)) {
        doctors = response.data;
      } 
      // If response.data has a data property that's an array, use that
      else if (response.data && Array.isArray(response.data.data)) {
        doctors = response.data.data;
      }
      // If response.data has a success property and a data array, use that
      else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        doctors = response.data.data;
      }
      // If response.data has a doctors array, use that
      else if (response.data && Array.isArray(response.data.doctors)) {
        doctors = response.data.doctors;
      }
      
      console.log(`✅ Found ${doctors.length} doctors`, doctors);
      return doctors;
      
    } catch (error) {
      console.error('Detailed error in getDoctors:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params
        },
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        }
      });
      
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  },
  
  // Appointment management
  getAppointments: async () => {
    try {
      const response = await api.get('/receptionist/appointments');
      console.log('getAppointments response:', response);
      // Handle both response structures: response.data.data and response.data
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error in getAppointments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  createAppointment: (data) => api.post('/receptionist/appointments', data),
  updateAppointment: (id, data) => api.put(`/receptionist/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/receptionist/appointments/${id}`),
  deletePatient: (id) => api.delete(`/receptionist/patients/${id}`),
};

export default api;
