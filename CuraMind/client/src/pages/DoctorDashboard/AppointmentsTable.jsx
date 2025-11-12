import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { appointmentAPI } from '../../services/api';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';

const AppointmentsTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
  const doctorId = doctorInfo?._id;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!doctorId) {
          throw new Error('Doctor ID not found. Please log in again.');
        }
        
        setLoading(true);
        
        // First, try the new endpoint
        try {
          const response = await api.get(`/appointments/doctor/${doctorId}`);
          
          // The data is in response.data.data (first data is axios, second is our API)
          const responseData = response.data?.data || {};
          // The appointments array is in the 'data' property of responseData
          const appointmentsData = Array.isArray(responseData) ? responseData : [];
          
          if (!appointmentsData.length) {
            setAppointments([]);
            return;
          }
            
          // Sort appointments by date and time (newest first)
          const sortedAppointments = [...appointmentsData].sort((a, b) => {
            try {
              const dateA = new Date(a.appointmentDate);
              const dateB = new Date(b.appointmentDate);
              return dateB - dateA;
            } catch (e) {
              console.error('Error sorting appointments:', e);
              return 0;
            }
          });
          
          setAppointments(sortedAppointments);
          return; // Success, exit the function
        } catch (apiError) {
          console.warn('Primary endpoint failed, falling back to alternative method', apiError);
          
          // Fallback to filtering all appointments if the specific endpoint fails
          const response = await api.get('/appointments');
          const allAppointments = response.data?.data || [];
          
          if (!Array.isArray(allAppointments)) {
            throw new Error('Invalid data format received from server');
          }
          
          // Filter appointments for the current doctor
          const doctorAppointments = allAppointments.filter(
            appt => appt.doctor?._id === doctorId || appt.doctor === doctorId
          );
          
          // Sort appointments by date and time (newest first)
          const sortedAppointments = [...doctorAppointments].sort((a, b) => {
            try {
              const dateA = new Date(a.appointmentDate);
              const dateB = new Date(b.appointmentDate);
              return dateB - dateA;
            } catch (e) {
              console.error('Error sorting appointments:', e);
              return 0;
            }
          });
          
          setAppointments(sortedAppointments);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load appointments';
        toast.error(errorMessage);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      
      // Handle different date string formats
      let date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      } 
      // If it's a string that looks like a date
      else if (typeof dateString === 'string') {
        // Try parsing as ISO string first
        date = new Date(dateString);
        
        // If that doesn't work, try parsing as timestamp
        if (isNaN(date.getTime())) {
          const timestamp = Date.parse(dateString);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          }
        }
      }
      
      // If we still don't have a valid date, try to extract date parts
      if (!date || isNaN(date.getTime())) {
        // Try to extract date parts from string (format: YYYY-MM-DD)
        const dateMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          date = new Date(dateMatch[1], dateMatch[2] - 1, dateMatch[3]);
        }
      }
      
      // If we still don't have a valid date, return the original string
      if (!date || isNaN(date.getTime())) {
        console.warn('Could not parse date:', dateString);
        return dateString; // Return original string if we can't parse it
      }
      
      return format(date, 'dd MMM yyyy');
    } catch (e) {
      console.error('Error formatting date:', e, 'Date string:', dateString);
      return dateString || 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) {
      return 'N/A';
    }
    
    try {
      // Check if it's already in HH:MM format (e.g., "14:30")
      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        return format(date, 'h:mm a');
      }
      
      // Check if it's in 12-hour format with AM/PM (e.g., "2:30 PM")
      if (/^\d{1,2}:\d{2}\s*[AP]M$/i.test(timeString)) {
        return timeString.toUpperCase(); // Return as is but standardize case
      }
      
      // Try to parse as ISO time string (e.g., "14:30:00")
      const date = new Date(`2000-01-01T${timeString}`);
      if (!isNaN(date.getTime())) {
        return format(date, 'h:mm a');
      }
      
      // If we get here, return the original string
      return timeString;
      
      } catch (e) {
        console.error('Error formatting time:', e, 'Time string:', timeString);
      return timeString || 'Invalid time';
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      const responseData = response.data?.data || {};
      const appointmentsData = Array.isArray(responseData) ? responseData : [];
      
      if (appointmentsData.length > 0) {
        const sortedAppointments = [...appointmentsData].sort((a, b) => {
          try {
            const dateA = new Date(a.date || a.appointmentDate);
            const dateB = new Date(b.date || b.appointmentDate);
            return dateB - dateA;
          } catch (e) {
            console.error('Error sorting appointments:', e);
            return 0;
          }
        });
        setAppointments(sortedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      toast.error('Failed to refresh appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-4 shadow-sm text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments scheduled</h3>
          <p className="mt-1 text-gray-500">You don't have any upcoming appointments.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {appointment.patient?.name ? appointment.patient.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient?.phone || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(appointment.date || appointment.appointmentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.time ? formatTime(appointment.time) : 
                     appointment.appointmentTime ? formatTime(appointment.appointmentTime) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {appointment.reason || 'Not specified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTable;
