import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api';
import { AxiosInstance } from 'axios';
import { User } from '../types/user';

type ApiResponse<T = any> = {
  success: boolean;
  data: T;
  message?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  error: null,
  login: async () => {
    throw new Error('AuthProvider not found');
  },
  logout: () => {
    throw new Error('AuthProvider not found');
  },
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = useCallback(async (): Promise<void> => {
    console.log('fetchUser called');
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }

      console.log('Fetching user data...');
      const response = await api.get<{ data: User }>('/auth/me');
      console.log('User data response:', response.data);
      
      const userData = response.data.data;
      const user = {
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'doctor',
        isAdmin: userData.isAdmin
      };
      
      console.log('Setting user state:', user);
      setUser(user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      console.log('Removing invalid token from localStorage');
      localStorage.removeItem('token');
      
      // Clear any existing auth headers
      if (api.defaults.headers) {
        delete api.defaults.headers.common['Authorization'];
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<User> => {
    console.log('🔐 Starting login process...');
    try {
      setLoading(true);
      setError(null);
      
      if (!email || !password) {
        const errorMsg = 'Email and password are required';
        console.error('Validation error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Sending login request to /auth/login...');
      const response = await api.post<{ 
        success: boolean; 
        data?: User;
        user?: User;
        token?: string;
        message?: string;
      }>(
        '/auth/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true // Important for cookies
        }
      );
      
      console.log('✅ Login response received:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      if (!response.data.success) {
        const errorMsg = response.data.message || 'Login failed';
        console.error('❌ Login failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Handle different response formats
      const responseData = response.data;
      let user: User;
      let token: string | undefined;

      // Extract user and token from response
      if (responseData.data) {
        // Format: { success: true, data: { ...user }, token: '...' }
        user = responseData.data;
        token = (responseData as any).token;
      } else if (responseData.user) {
        // Format: { success: true, user: { ...user }, token: '...' }
        user = responseData.user;
        token = (responseData as any).token;
      } else {
        // Format: { success: true, ...user, token: '...' }
        const { success, message, ...userData } = responseData;
        user = userData as User;
        token = (responseData as any).token;
      }
      
      if (!user || !token) {
        const errorMsg = 'Invalid response format: missing user data or token';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('🔑 Login successful, user:', user);
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      console.log('💾 Token stored in localStorage');
      
      // Set the default Authorization header for subsequent requests
      if (api.defaults.headers) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🔒 Authorization header set');
      }
      
      // Update the user state
      console.log('🔄 Updating user state...');
      setUser(user);
      
      // Ensure user has a role, default to 'doctor' if not provided
      const userRole = user.role || 'doctor';
      const redirectTo = userRole === 'doctor' ? '/doctor' : '/patient';
      console.log('🔄 Redirecting to:', redirectTo);
      
      // Add a small delay before redirecting to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use navigate instead of window.location for better SPA behavior
      navigate(redirectTo, { replace: true });
      
      console.log('✅ Login flow completed successfully');
      return user;
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle different types of errors
      if (error.isNetworkError) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.isTimeout) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response) {
        // Server responded with an error status code
        const { status, data } = error.response;
        
        if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your input.';
        } else if (status === 401) {
          errorMessage = data?.message || 'Invalid email or password. Please try again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to access this resource.';
        } else if (status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (status >= 500) {
          errorMessage = 'A server error occurred. Please try again later.';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else if (error.message) {
        // Error occurred in setting up the request
        errorMessage = error.message;
      }
      
      console.error('❌ Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          withCredentials: error.config?.withCredentials,
          headers: error.config?.headers
        }
      });
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (api.defaults.headers) {
      delete api.defaults.headers.common['Authorization'];
    }
    navigate('/login', { replace: true });
  };

  // Handle 401 Unauthorized responses is now handled by the API interceptor

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
