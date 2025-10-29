import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import { ToastContainer, toast } from 'react-toastify';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';
import 'glightbox/dist/css/glightbox.min.css';
import './index.css';

// Import Components
import Layout from './components/Layout';

// Import Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import Appointment from './pages/Appointment';
import Doctors from './pages/Doctors';
import Login from './pages/Login.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard.jsx';

// Protected Route Component for all user types
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      // Check if we have a token and user data
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('user');
      
      // If we have all required auth data, consider the user authenticated
      // The token will be verified on the first API call via the interceptor
      setIsValid(!!(token && userType && userData));
      
      if (!token || !userType || !userData) {
        // Clear any partial auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
      } 
      setIsLoading(false);
    };
    
    verifyToken();
  }, [token]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!token || !isValid) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    toast.error('You do not have permission to access this page');
    // Redirect to appropriate dashboard based on user type
    if (userType === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (userType === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (userType === 'receptionist') return <Navigate to="/receptionist-dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
};


function App() {
  // Initialize AOS animation
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Routes>
          {/* Public Routes with Layout (Header + Footer) */}
          <Route path="/" element={
            <Layout>
              <LandingPage />
            </Layout>
          } />
          <Route path="/about" element={
            <Layout>
              <AboutPage />
            </Layout>
          } />
          <Route path="/appointment" element={
            <Layout>
              <Appointment />
            </Layout>
          } />
          <Route path="/doctors" element={
            <Layout>
              <Doctors />
            </Layout>
          } />
          
          {/* Public Routes without Layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/doctor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/receptionist-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect admin to admin dashboard */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Navigate to="/admin-dashboard" replace />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast Container for notifications */}
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </main>
    </div>
  );
}

export default App;
