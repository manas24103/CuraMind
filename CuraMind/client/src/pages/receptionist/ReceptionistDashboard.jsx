import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, appointmentAPI, doctorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  FaUserPlus, FaCalendarPlus, FaEdit, FaTrash, FaUserMd, 
  FaUserInjured, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaVenusMars, FaBirthdayCake, FaClock, FaNotesMedical,
  FaUserCircle, FaSignOutAlt, FaHome
} from 'react-icons/fa';
import { BsCalendarDate } from 'react-icons/bs';

const ReceptionistDashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState({
    patients: true,
    doctors: true,
    appointments: true
  });
  const [activeTab, setActiveTab] = useState('patients');
  const navigate = useNavigate();
  const receptionistInfo = JSON.parse(localStorage.getItem('receptionistInfo') || '{}');

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown-area')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('receptionistToken');
    localStorage.removeItem('receptionistInfo');
    
    // Ensure navigation happens in the next tick to avoid any race conditions
    setTimeout(() => {
      navigate('/receptionist-login', { replace: true });
    }, 0);
  };

  const navigateToProfile = () => {
    // You can implement profile navigation here
    navigate('/receptionist/profile');
    setShowDropdown(false);
  };

  const navigateToHome = () => {
    navigate('/receptionist/dashboard');
    setShowDropdown(false);
  };

  // Form states
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    date: new Date(),
    time: '',
    reason: '',
    status: 'scheduled'
  });

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          patientAPI.getPatients(),
          doctorAPI.getDoctors(),
          appointmentAPI.getAppointments()
        ]);

        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setAppointments(appointmentsRes.data);
        
        setIsLoading({ patients: false, doctors: false, appointments: false });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setIsLoading({ patients: false, doctors: false, appointments: false });
      }
    };

    fetchData();
  }, []);

  // Handle form changes
  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppointmentFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change for appointment
  const handleDateChange = (date) => {
    setAppointmentForm(prev => ({
      ...prev,
      date: date
    }));
  };

  // Create new patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const response = await patientAPI.createPatient(patientForm);
      setPatients(prev => [...prev, response.data]);
      setShowPatientModal(false);
      toast.success('Patient created successfully');
      
      // Reset form
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'male'
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error(error.response?.data?.message || 'Failed to create patient');
    }
  };

  // Book appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      // Format date and time
      const appointmentDate = new Date(appointmentForm.date);
      const [hours, minutes] = appointmentForm.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));
      
      const appointmentData = {
        ...appointmentForm,
        dateTime: appointmentDate.toISOString()
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      setAppointments(prev => [...prev, response.data]);
      setShowAppointmentModal(false);
      toast.success('Appointment booked successfully');
      
      // Reset form
      setAppointmentForm({
        patientId: '',
        doctorId: '',
        date: new Date(),
        time: '',
        reason: '',
        status: 'scheduled'
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Modal component
  const Modal = ({ isOpen, onClose, title, children, onSave, saveText = 'Save' }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
          <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 mr-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {saveText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Tab component
  const Tab = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm ${active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">CuraMind Reception</h1>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="ml-3 relative dropdown-area">
                  <div>
                    <button 
                      type="button" 
                      className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FaUserCircle className="h-6 w-6" />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {receptionistInfo.name || 'Receptionist'}
                      </span>
                    </button>
                  </div>
                  {showDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        <p className="font-medium">{receptionistInfo.email || 'receptionist@curamind.com'}</p>
                      </div>
                      <button
                        onClick={navigateToHome}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaHome className="inline mr-2" /> Home
                      </button>
                      <button
                        onClick={navigateToProfile}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaUserCircle className="inline mr-2" /> My Profile
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="inline mr-2" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Receptionist Dashboard</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-2">
          <Tab 
            active={activeTab === 'patients'} 
            onClick={() => setActiveTab('patients')}
          >
            Patients
          </Tab>
          <Tab 
            active={activeTab === 'appointments'} 
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </Tab>
        </div>
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Patients List</h3>
            <button
              onClick={() => setShowPatientModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaUserPlus className="mr-2" />
              Add New Patient
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading.patients ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map(patient => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUserInjured className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{patient.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {patient.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          {patient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaBirthdayCake className="mr-2 text-gray-400" />
                          {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowAppointmentModal(true);
                            setAppointmentForm(prev => ({
                              ...prev,
                              patientId: patient._id
                            }));
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaCalendarPlus className="inline mr-1" /> Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaCalendarPlus className="mr-2" />
              New Appointment
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading.appointments ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map(appointment => {
                    const patient = patients.find(p => p._id === appointment.patientId) || {};
                    const doctor = doctors.find(d => d._id === appointment.doctorId) || {};
                    
                    return (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{patient.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{patient.phone || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <FaUserMd className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Dr. {doctor.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{doctor.specialization || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(appointment.dateTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">{appointment.reason}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Add New Patient"
        onSave={handleCreatePatient}
      >
        <form onSubmit={handleCreatePatient}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={patientForm.name}
                onChange={handlePatientFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={patientForm.email}
                onChange={handlePatientFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={patientForm.phone}
                onChange={handlePatientFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={patientForm.dateOfBirth}
                onChange={handlePatientFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={patientForm.gender}
                onChange={handlePatientFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                rows="3"
                value={patientForm.address}
                onChange={handlePatientFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </form>
      </Modal>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        title={selectedPatient ? `Book Appointment for ${selectedPatient.name}` : 'Book New Appointment'}
        onSave={handleBookAppointment}
        saveText="Book Appointment"
      >
        <form onSubmit={handleBookAppointment}>
          <div className="space-y-4">
            {!selectedPatient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                <select
                  name="patientId"
                  value={appointmentForm.patientId}
                  onChange={handleAppointmentFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <select
                name="doctorId"
                value={appointmentForm.doctorId}
                onChange={handleAppointmentFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <DatePicker
                  selected={appointmentForm.date}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  name="time"
                  value={appointmentForm.time}
                  onChange={handleAppointmentFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea
                name="reason"
                rows="3"
                value={appointmentForm.reason}
                onChange={handleAppointmentFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe the reason for the appointment..."
                required
              ></textarea>
            </div>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
