import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";
import { FaSpinner, FaUserMd } from "react-icons/fa";

const Login = () => {
  // User types configuration
  const userTypes = [
    { value: "doctor", label: "Doctor", dashboard: "doctor-dashboard" },
    { value: "admin", label: "Administrator", dashboard: "admin-dashboard" },
    { value: "receptionist", label: "Receptionist", dashboard: "receptionist-dashboard" },
  ];

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    userType: "doctor", // default user type
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    // Skip token verification if we're in the middle of a login
    if (isLoading) return;
    
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");
      const userData = localStorage.getItem("user");

      if (!token || !userType || !userData) {
        console.log('Missing auth data in localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userConfig = userTypes.find((t) => t.value === userType);
        
        if (!userConfig) {
          console.warn('Invalid userType in localStorage:', userType);
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('user');
          return;
        }

        // If we have a valid token and user data, just redirect
        // Token will be verified on the first API call via the interceptor
        console.log('User already logged in, redirecting to dashboard');
        navigate(`/${userConfig.dashboard}`);
      } catch (error) {
        console.error('Error during token verification:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        // Clear auth data on error
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
      }
    };
    
    // Add a small delay to prevent flash
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate, userTypes]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Convert userType to match what the server expects
      const serverUserType = form.userType === 'admin' ? 'admin' : 
                           form.userType === 'receptionist' ? 'receptionist' : 'doctor';
      
      console.log('Attempting login with:', {
        email: form.email.trim().toLowerCase(),
        userType: serverUserType,
        password: form.password ? '***' : 'MISSING_PASSWORD'
      });
      
      // Make login request
      const response = await authAPI.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        userType: serverUserType
      });
      
      console.log('Login response:', response);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      
      const { token, data: userData } = response.data;
      console.log('Login successful, token:', token);
      console.log('User data from login:', userData);
      
      if (!userData || !userData.role) {
        throw new Error('Invalid user data received from server');
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userType', userData.role); // Use role from server response
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Find the dashboard path based on user role
      const userConfig = userTypes.find(t => t.value === userData.role);
      if (userConfig) {
        console.log(`Redirecting ${userData.role} to dashboard:`, `/${userConfig.dashboard}`);
        navigate(`/${userConfig.dashboard}`, { replace: true });
      } else {
        console.error('No dashboard configured for role:', userData.role);
        throw new Error(`No dashboard configured for user type: ${userData.role}`);
      }

    } catch (error) {
      console.error("Login error:", {
        message: error.message,
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        },
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section (Banner) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-600 text-white px-10 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 opacity-90"></div>
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <FaUserMd className="text-5xl text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to MediTrust Portal</h1>
          <p className="text-blue-100 max-w-md mx-auto">
            Your gateway to seamless healthcare management — log in to continue your work with ease and security.
          </p>
        </div>
      </div>

      {/* Right Section (Login Form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">Sign In</h2>
          <p className="text-gray-500 text-center mb-6">Access your MediTrust account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <select
                name="userType"
                value={form.userType}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {userTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-md text-white font-medium transition-colors ${
                isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contact administrator
            </Link>
          </div>
          <div className="text-center mt-3">
            <Link to="/" className="text-sm text-blue-500 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;