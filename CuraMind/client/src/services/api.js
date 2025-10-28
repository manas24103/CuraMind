import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Update with your backend URL
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
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('doctorToken');
        window.location.href = '/doctor-login';
      }
      
      const errorMessage = error.response.data?.message || 'An error occurred';
      toast.error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('No response from server. Please try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      toast.error('Request error. Please try again.');
    }
    return Promise.reject(error);
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
  getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getDoctorPrescriptions: (doctorId) => api.get(`/prescriptions/doctor/${doctorId}`)
};

export default api;
