import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Skip adding token for auth routes
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    // Get the token from localStorage
    const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
    
    if (token) {
      // Ensure the token is properly formatted (remove any quotes or extra spaces)
      const cleanToken = token.replace(/^['"]|['"]$/g, '').trim();
      
      // Log the token for debugging (first 10 chars only for security)
      console.log(`[API] Adding token to ${config.method?.toUpperCase()} ${config.url}:`, 
        cleanToken.substring(0, 10) + '...');
      
      // Set the Authorization header
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      };
    } else {
      console.warn('[API] No authentication token found for request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Only handle 401 for non-prescription endpoints
    if (error.response?.status === 401 && !error.config?.url.includes('/prescriptions/')) {
      console.warn('Authentication error - clearing tokens and redirecting to login');
      // Clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('doctorToken');
      // Redirect to login
      window.location.href = '/login';
    }
    
    // Return a rejected promise with the error
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
  suggestDiagnosis: (symptoms) => api.post('/doctors/ai/suggest-diagnosis', { symptoms }),
};

// Patient API
export const patientAPI = {
  // Admin and Receptionist only
  getPatients: () => api.get('/patients'),
  createPatient: (data) => api.post('/patients', data),
  
  // Accessible by patient, their doctor, admin, or receptionist
  getPatient: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  getRecentPatients: (doctorId) => api.get(`/patients/recent/${doctorId}`),
  
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
  
  suggestDiagnosis: async (requestData) => {
    try {
      // Extract and clean the data
      const cleanData = {
        symptoms: typeof requestData.symptoms === 'string' 
          ? requestData.symptoms.trim() 
          : JSON.stringify(requestData.symptoms || ''),
        patientName: requestData.patientName || 'Temporary',
        patientId: requestData.patientId || 'temp-id',
        diagnosis: requestData.diagnosis || 'Temporary diagnosis',
        medicalHistory: requestData.medicalHistory || '',
        medications: requestData.medications || [],
        instructions: requestData.instructions || ''
      };
      
      console.log('[PrescriptionAPI] Sending diagnosis request with data:', cleanData);
      
      // Get the token
      const token = (localStorage.getItem('doctorToken') || localStorage.getItem('token') || '').replace(/^['"]|['"]$/g, '').trim();
      console.log('[PrescriptionAPI] Using token:', token ? `${token.substring(0, 10)}...` : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.post('/prescriptions/generate', cleanData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Prevent the interceptor from handling 401 for this request
        _handle401: false
      });
      
      console.log('[PrescriptionAPI] Received response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      return response;
      
    } catch (error) {
      console.error('[PrescriptionAPI] Error in suggestDiagnosis:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      throw error; // Re-throw to let the component handle it
    }
  },
  
  generate: async (data) => {
    console.log('[PrescriptionAPI] Generating prescription with data:', data);
    try {
      const token = (localStorage.getItem('doctorToken') || localStorage.getItem('token') || '').replace(/^['"]|['"]$/g, '').trim();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.post('/prescriptions/generate', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Prevent the interceptor from handling 401 for this request
        _handle401: false
      });
      
      return response;
      
    } catch (error) {
      console.error('[PrescriptionAPI] Error in generate:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Don't logout on 401 for prescription generation
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw error;
    }
  }
};

export default api;
