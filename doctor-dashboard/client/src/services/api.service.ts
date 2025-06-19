import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Update with your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // If the response data has a success flag, return the data directly
    if (response.data && typeof response.data.success !== 'undefined') {
      return response;
    }
    // Otherwise, wrap the response data in a success response
    return {
      ...response,
      data: { success: true, data: response.data }
    };
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle common errors (401, 403, 404, etc.)
    if (error.response) {
      // Handle HTTP errors
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Return the error response if it exists, otherwise create a generic one
      return Promise.reject({
        success: false,
        error: data?.error || error.message,
        message: data?.message || 'An error occurred',
        status
      });
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        success: false,
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.'
      });
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        success: false,
        error: 'Request Error',
        message: error.message || 'An error occurred while processing your request.'
      });
    }
  }
);

// Generic GET request
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Generic POST request
export const post = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Generic PUT request
export const put = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Generic PATCH request
export const patch = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Generic DELETE request
export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Export the axios instance and all methods
export default {
  // Axios instance
  instance: api,
  
  // HTTP methods
  get,
  post,
  put,
  patch,
  delete: del,
  
  // Common API endpoints can be added here
  auth: {
    login: (credentials: { email: string; password: string }) => 
      post<{ token: string; user: any }>('/auth/login', credentials),
    getProfile: () => get<any>('/auth/me'),
  },
  
  doctors: {
    getAll: () => get<any[]>('/doctors'),
    getById: (id: string) => get<any>(`/doctors/${id}`),
    create: (data: any) => post<any>('/doctors', data),
    update: (id: string, data: any) => put<any>(`/doctors/${id}`, data),
    delete: (id: string) => del<any>(`/doctors/${id}`),
  },
  
  // Add more API endpoints as needed
  appointments: {
    getAll: () => get<any[]>('/appointments'),
    getById: (id: string) => get<any>(`/appointments/${id}`),
    create: (data: any) => post<any>('/appointments', data),
    update: (id: string, data: any) => put<any>(`/appointments/${id}`, data),
    delete: (id: string) => del<any>(`/appointments/${id}`),
  },
  
  patients: {
    getAll: () => get<any[]>('/patients'),
    getById: (id: string) => get<any>(`/patients/${id}`),
    create: (data: any) => post<any>('/patients', data),
    update: (id: string, data: any) => put<any>(`/patients/${id}`, data),
    delete: (id: string) => del<any>(`/patients/${id}`),
  },
};
