import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import { ToastContainer, toast } from 'react-toastify';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'swiper/css';
import 'glightbox/dist/css/glightbox.min.css';
import './assets/css/main.css';

// Import Pages
import LandingPage from './pages/LandingPage';
import Appointment from './pages/Appointment';
import Doctors from './pages/Doctors';
import Login from './pages/Login.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard.jsx';


// Protected Route Component for all user types
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
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
    <div className="App">
      <main id="main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/doctors" element={<Doctors />} />
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
