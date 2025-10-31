import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAuth = async () => {
      // First check for doctor token (which is stored separately)
      const doctorToken = localStorage.getItem('doctorToken');
      const doctorInfo = localStorage.getItem('doctorInfo');
      
      if (doctorToken && doctorInfo) {
        // Doctor is logged in
        setUserType('doctor');
        setIsValid(true);
        setIsLoading(false);
        return;
      }
      
      // Check for regular user token
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      // For non-doctor users
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('user');
      
      setUserType(userType);
      setIsValid(!!(token && userType && userData));
      
      if (!token || !userType || !userData) {
        // Clear any partial auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
      } 
      setIsLoading(false);
    };
    
    verifyAuth();
  }, []);
  
  // Handle unauthorized access
  useEffect(() => {
    if (!isLoading && !isValid) {
      // If we're not loading but not valid, redirect to login
      navigate('/login');
    }
  }, [isLoading, isValid, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if ((!localStorage.getItem('doctorToken') && !localStorage.getItem('token')) || !isValid) {
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
        
        {/* Toast Container for notifications - Using a stable key to force remount if needed */}
        <div key="toast-container">
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
            closeButton={false}  // Disable default close button to prevent issues
            className="toast-container"
            toastClassName="toast"
            bodyClassName="toast-body"
            progressClassName="toast-progress"
          />
        </div>
      </main>
    </div>
  );
}

export default App;
