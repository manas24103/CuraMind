import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './services/auth';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentCalendar from './components/AppointmentCalendarComponent';
import Login from './pages/Login';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const location = useLocation();
  console.log('ProtectedRoute - Auth state:', {
    loading: 'loading' in auth ? auth.loading : 'N/A',
    isAuthenticated: 'isAuthenticated' in auth ? auth.isAuthenticated : 'N/A',
    user: 'user' in auth ? auth.user : 'N/A'
  });

  const isLoading = 'loading' in auth ? auth.loading : true;
  const isAuthenticated = 'isAuthenticated' in auth ? auth.isAuthenticated : false;

  if (isLoading) {
    console.log('ProtectedRoute - Loading...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient" 
              element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <AppointmentCalendar />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/appointments" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
