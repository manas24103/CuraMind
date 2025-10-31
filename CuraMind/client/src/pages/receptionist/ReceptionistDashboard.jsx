import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { receptionistAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaUserPlus, FaCalendarPlus, FaUserInjured, 
  FaPhone, FaEnvelope, FaBirthdayCake,
  FaUserCircle, FaSignOutAlt, FaHome, FaCalendarAlt, FaUserMd, FaUser, FaEdit, FaTrash, FaSearch, FaPlus, FaTimes, FaSyncAlt
} from 'react-icons/fa';

// Reusable tab component
const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
      active
        ? 'bg-white text-blue-600 border-t-2 border-blue-600'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

// Reusable modal component
const Modal = ({ isOpen, onClose, title, onSave, saveText, disabled, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={disabled}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              disabled && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    bloodGroup: '',
    assignedDoctor: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    reason: '',
    patientId: ''
  });

  // Helper function to find a patient's doctor from appointments
  const findDoctorForPatient = (patientId, appointmentsData, doctorsList) => {
    if (!patientId) return null;
    
    // Find the most recent appointment for this patient
    const patientAppointments = appointmentsData
      .filter(appt => {
        const apptPatientId = appt.patient?._id || appt.patientId || appt.patient;
        return apptPatientId === patientId && (appt.doctorId || appt.doctor);
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    if (patientAppointments.length > 0) {
      const latestAppointment = patientAppointments[0];
      const doctorId = latestAppointment.doctor?._id || latestAppointment.doctorId?._id || latestAppointment.doctorId;
      
      if (!doctorId) return null;
      
      // Find the doctor in the doctors list
      return doctorsList.find(d => 
        d._id === doctorId || d.id === doctorId
      ) || { _id: doctorId, name: 'Unknown Doctor' };
    }
    
    return null;
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [patientsRes, doctorsRes, apptRes] = await Promise.all([
        receptionistAPI.getPatients(),
        receptionistAPI.getDoctors(),
        receptionistAPI.getAppointments(),
      ]);
      
      // Process doctors data to ensure consistent ID field
      const doctorsData = Array.isArray(doctorsRes)
        ? doctorsRes
        : (doctorsRes?.data || []);
        
      const formattedDoctors = doctorsData.map(doctor => ({
        ...doctor,
        _id: doctor._id || doctor.id,
        id: doctor._id || doctor.id
      }));
      
      // Process appointments - handle both direct array and nested data structure
      let appointmentsData = [];
      if (Array.isArray(apptRes)) {
        appointmentsData = apptRes;
      } else if (apptRes?.data && Array.isArray(apptRes.data)) {
        appointmentsData = apptRes.data;
      } else if (apptRes?.appointments && Array.isArray(apptRes.appointments)) {
        appointmentsData = apptRes.appointments;
      }

      // Process patients
      const patientsData = (Array.isArray(patientsRes) ? patientsRes : (patientsRes?.data || [])).map(patient => {
        const patientId = patient._id || patient.id;
        
        // Handle assignedDoctor from the server response
        let assignedDoctor = null;
        if (patient.assignedDoctor) {
          // If assignedDoctor is already populated by the server
          assignedDoctor = {
            _id: patient.assignedDoctor._id || patient.assignedDoctor,
            id: patient.assignedDoctor._id || patient.assignedDoctor,
            name: patient.assignedDoctor.name || 'Unknown Doctor',
            specialization: patient.assignedDoctor.specialization,
            email: patient.assignedDoctor.email
          };
        } else {
          // Fallback to finding from appointments if not provided by server
          assignedDoctor = findDoctorForPatient(patientId, appointmentsData, formattedDoctors);
        }
        
        return {
          ...patient,
          _id: patientId,
          id: patientId,
          assignedDoctor: assignedDoctor || null
        };
      });
      
      // Debug logs
      console.log('Processed data:', {
        patients: patientsData,
        doctors: formattedDoctors,
        appointments: appointmentsData
      });
      
      setPatients(patientsData);
      setDoctors(formattedDoctors);
      setAppointments(appointmentsData);
    } catch (err) {
      toast.error('Error loading data');
      console.error('Error in fetchData:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create new patient
  const handleCreatePatient = async () => {
    // Client-side validation
    if (!patientForm.name?.trim() || !patientForm.phone?.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    
    // Ensure a doctor is selected
    if (!patientForm.assignedDoctor) {
      toast.error('Please assign a doctor to this patient');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the selected doctor's ID if available
      const doctorId = patientForm.assignedDoctor ? 
        (patientForm.assignedDoctor._id || patientForm.assignedDoctor.id || patientForm.assignedDoctor) : 
        null;
      
      // Prepare patient data with all fields
      const patientData = {
        name: patientForm.name.trim(),
        phone: patientForm.phone.trim(),
        email: patientForm.email?.trim() || '',
        age: patientForm.age ? parseInt(patientForm.age) : 0,
        gender: patientForm.gender || 'other',
        dateOfBirth: patientForm.dateOfBirth || new Date().toISOString().split('T')[0],
        bloodGroup: patientForm.bloodGroup,
        doctorId: doctorId, // Send doctorId directly
        address: {
          street: patientForm.address.street?.trim() || '',
          city: patientForm.address.city?.trim() || '',
          state: patientForm.address.state?.trim() || '',
          pincode: patientForm.address.pincode?.trim() || ''
        },
        medicalHistory: []
      };
      
      console.log('Sending patient data:', patientData);
      
      const response = await receptionistAPI.createPatient(patientData);
      console.log('Patient created:', response);
      
      // Format the assigned doctor data for the new patient
      let assignedDoctorData = null;
      if (response.data.assignedDoctor) {
        // If backend returns populated doctor data
        assignedDoctorData = {
          _id: response.data.assignedDoctor._id || response.data.assignedDoctor,
          id: response.data.assignedDoctor._id || response.data.assignedDoctor,
          name: response.data.assignedDoctor.name || 'Unknown Doctor',
          specialization: response.data.assignedDoctor.specialization,
          email: response.data.assignedDoctor.email
        };
      } else if (patientForm.assignedDoctor) {
        // Fallback to form data if backend doesn't return populated data
        assignedDoctorData = {
          _id: patientForm.assignedDoctor._id || patientForm.assignedDoctor.id || patientForm.assignedDoctor,
          id: patientForm.assignedDoctor._id || patientForm.assignedDoctor.id || patientForm.assignedDoctor,
          name: patientForm.assignedDoctor.name || 'Unknown Doctor',
          specialization: patientForm.assignedDoctor.specialization,
          email: patientForm.assignedDoctor.email
        };
      }
      
      // Create the new patient object with the assigned doctor
      const newPatient = {
        ...response.data,
        _id: response.data._id || response.data.id,
        id: response.data._id || response.data.id,
        assignedDoctor: assignedDoctorData
      };
      
      // Update the patients state with the new patient
      setPatients(prevPatients => [{
        ...response.data,
        _id: response.data._id || response.data.id,
        id: response.data._id || response.data.id,
        assignedDoctor: assignedDoctorData
      }, ...prevPatients]);
      
      // Reset the form
      setPatientForm({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        bloodGroup: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: ''
        },
        assignedDoctor: null
      });
      
      setShowPatientModal(false);
      toast.success('Patient added successfully');
    } catch (err) {
      console.error('Error creating patient:', err);
      toast.error('Failed to add patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    patientId: null,
    patientName: ''
  });

  // Open delete confirmation
  const confirmDelete = (patient) => {
    setDeleteConfirmation({
      isOpen: true,
      patientId: patient._id || patient.id,
      patientName: patient.name
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.patientId) {
      setDeleteConfirmation({ isOpen: false, patientId: null, patientName: '' });
      return;
    }

    try {
      setIsLoading(true);
      await receptionistAPI.deletePatient(deleteConfirmation.patientId);
      setPatients(patients.filter(p => p._id !== deleteConfirmation.patientId));
      toast.success('Patient deleted successfully');
    } catch (err) {
      console.error('Error deleting patient:', err);
      toast.error('Failed to delete patient');
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ isOpen: false, patientId: null, patientName: '' });
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, patientId: null, patientName: '' });
  };

  // Open booking modal for selected patient
  const handleBookClick = (patient) => {
    setSelectedPatient(patient);
    // Reset the form with fresh data for the selected patient
    setAppointmentForm({
      doctorId: patient.assignedDoctor?._id || '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      reason: '',
      patientId: patient._id
    });
    setShowBookModal(true);
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
  };

  const handleUpdateDoctor = async () => {
    if (!editingPatient) return;
    
    try {
      setIsLoading(true);
      await api.put(`/patients/${editingPatient._id}`, {
        doctorId: editingPatient.assignedDoctor?._id || null
      });
      
      // Update the patients list with the new doctor assignment
      setPatients(patients.map(p => 
        p._id === editingPatient._id ? editingPatient : p
      ));
      
      toast.success('Doctor assignment updated successfully');
      setEditingPatient(null);
    } catch (error) {
      console.error('Error updating doctor assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to update doctor assignment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking appointment
  const handleBookAppointment = async () => {
    if (!selectedPatient) {
      toast.error('No patient selected');
      return;
    }
    if (!selectedPatient.assignedDoctor) {
      toast.error('Please assign a doctor to this patient first');
      return;
    }
    if (!appointmentForm.time) {
      toast.error('Please select a time for the appointment');
      return;
    }

    try {
      setIsLoading(true);
      
      // First, check for existing appointments for this patient on the same date
      const existingAppointments = await receptionistAPI.getAppointments({
        patientId: selectedPatient._id || selectedPatient.id,
        date: appointmentForm.date
      });
      
      // If there are existing appointments for this patient on the same date
      if (existingAppointments.data && existingAppointments.data.length > 0) {
        const existingAppointment = existingAppointments.data[0];
        const appointmentDate = new Date(existingAppointment.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        toast.error(`This patient already has an appointment on ${appointmentDate}`);
        return;
      }

      // If no existing appointment, proceed with creating a new one
      const appointmentData = {
        patientId: selectedPatient._id || selectedPatient.id,
        doctorId: selectedPatient.assignedDoctor._id || selectedPatient.assignedDoctor.id || selectedPatient.assignedDoctor,
        date: appointmentForm.date,
        time: appointmentForm.time,
        reason: appointmentForm.reason || 'General Checkup',
        status: 'scheduled'
      };
      
      console.log('Sending appointment data:', appointmentData);
      
      const response = await receptionistAPI.createAppointment(appointmentData);
      console.log('Appointment created:', response);
      
      toast.success('Appointment booked successfully!');
      setShowBookModal(false);
      fetchData();
    } catch (err) {
      console.error('Error booking appointment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to book appointment';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
          <FaUserMd /> Receptionist Dashboard
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </nav>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="border-b flex gap-2">
          <Tab active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
            Patients
          </Tab>
          <Tab active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
            Appointments
          </Tab>
        </div>

        {/* Patients */}
        {activeTab === 'patients' && (
          <div className="bg-white mt-4 rounded-lg shadow">
            <div className="p-4 flex justify-between">
              <h3 className="text-lg font-semibold">Patients List</h3>
              <button
                onClick={() => setShowPatientModal(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <FaUserPlus className="mr-2" /> Add New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-t">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Age</th>
                    <th className="p-3">Assigned Doctor</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No patients found. Add a new patient to get started.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p) => {
                      // The assignedDoctor is already populated in fetchData
                      const assignedDoctor = p.assignedDoctor;
                        
                      return (
                        <tr key={p._id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                                {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                              </div>
                              <div>
                                <div>{p.name || '—'}</div>
                                <div className="text-xs text-gray-500">{p.email || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <a href={`tel:${p.phone}`} className="text-blue-600 hover:underline">
                              {p.phone || '—'}
                            </a>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {p.age ? `${p.age} yrs` : '—'}
                            </span>
                          </td>
                          <td className="p-3">
                            {assignedDoctor ? (
                              <div className="flex items-center">
                                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mr-2">
                                  {assignedDoctor.name ? assignedDoctor.name.charAt(0).toUpperCase() : 'D'}
                                </div>
                                <span>Dr. {assignedDoctor.name || 'Unknown'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs mr-2">
                                  <FaUserMd className="text-xs" />
                                </div>
                                <span className="text-gray-400">Not assigned</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleBookClick(p)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center"
                                title="Book Appointment"
                              >
                                <FaCalendarPlus className="mr-1" /> Book
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(p);
                                }}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Edit Doctor"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(p);
                                }}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Delete"
                                disabled={isLoading}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-white mt-4 rounded-lg shadow">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Appointments</h3>
              <button
                onClick={fetchData}
                className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    <FaSyncAlt className="mr-1" /> Refresh
                  </>
                )}
              </button>
            </div>
            <table className="w-full text-sm border-t">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => {
                    // Debug log to check appointment data
                    console.log('Appointment data:', appointment);
                    
                    // Use populated data from the API with proper fallbacks
                    const patient = typeof appointment.patient === 'object' ? appointment.patient : {};
                    const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : {};
                    
                    // Format date and time
                    const appointmentDate = appointment.date ? new Date(appointment.date) : null;
                    const formattedDate = appointmentDate ? appointmentDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '—';
                    
                    // Format time if available
                    const formattedTime = appointment.time || (appointmentDate ? appointmentDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '—');
                    
                    return (
                      <tr key={appointment._id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                              {patient && patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div>
                              <div>{patient && patient.name ? patient.name : '—'}</div>
                              <div className="text-xs text-gray-500">
                                {patient && patient.phone ? patient.phone : '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {doctor && (doctor._id || doctor.id) ? (
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mr-2">
                                {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                              </div>
                              <div>
                                <div>Dr. {doctor.name || '—'}</div>
                                <div className="text-xs text-gray-500">
                                  {doctor.specialization || '—'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-medium">
                            {formattedDate}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formattedTime}
                          </div>
                        </td>
                        <td className="p-3">
                          {appointment.status ? 
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span> : '—'
                          }
                        </td>
                        <td className="p-3">
                          <div className="text-gray-700">
                            {appointment.reason || appointment.purpose || appointment.notes || '—'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Add New Patient"
        onSave={handleCreatePatient}
        saveText="Add"
        disabled={isLoading}
      >
        <div className="space-y-3">
        {/* Doctor Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Doctor <span className="text-red-500">*</span>
          </label>
          <select
            value={patientForm.assignedDoctor || ''}
            onChange={(e) => setPatientForm({ 
              ...patientForm, 
              assignedDoctor: e.target.value || null 
            })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                Dr. {doctor.name} ({doctor.specialization || 'General'})
              </option>
            ))}
          </select>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input 
              name="name" 
              placeholder="Full Name" 
              className="w-full border p-2 rounded"
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} 
              required
            />
          </div>
          <div>
            <input 
              type="number" 
              name="age" 
              placeholder="Age" 
              min="0"
              className="w-full border p-2 rounded"
              value={patientForm.age}
              onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} 
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <select 
              name="gender" 
              className="w-full border p-2 rounded"
              value={patientForm.gender}
              onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone Number" 
              className="w-full border p-2 rounded"
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              className="w-full border p-2 rounded"
              value={patientForm.email}
              onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              required
            />
          </div>
          <div>
            <select 
              name="bloodGroup" 
              className="w-full border p-2 rounded"
              value={patientForm.bloodGroup || ''}
              onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Address Section */}
        <div className="border-t pt-3 mt-4">
          <h4 className="font-medium mb-2">Address</h4>
          <input 
            type="text" 
            name="street" 
            placeholder="Street Address" 
            className="w-full border p-2 rounded mb-2"
            value={patientForm.address.street}
            onChange={(e) => setPatientForm({ 
              ...patientForm, 
              address: { ...patientForm.address, street: e.target.value } 
            })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              name="city" 
              placeholder="City" 
              className="w-full border p-2 rounded"
              value={patientForm.address.city}
              onChange={(e) => setPatientForm({ 
                ...patientForm, 
                address: { ...patientForm.address, city: e.target.value } 
              })}
              required
            />
            <input 
              type="text" 
              name="state" 
              placeholder="State" 
              className="w-full border p-2 rounded"
              value={patientForm.address.state}
              onChange={(e) => setPatientForm({ 
                ...patientForm, 
                address: { ...patientForm.address, state: e.target.value } 
              })}
              required
            />
          </div>
          <input 
            type="text" 
            name="pincode" 
            placeholder="Pincode" 
            className="w-full border p-2 rounded mt-2"
            value={patientForm.address.pincode}
            onChange={(e) => setPatientForm({ 
              ...patientForm, 
              address: { ...patientForm.address, pincode: e.target.value } 
            })}
            required
          />
        </div>
      </div>
      </Modal>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title={`Book Appointment for ${selectedPatient?.name || ''}`}
        onSave={handleBookAppointment}
        saveText="Book"
        disabled={isLoading || !selectedPatient?.assignedDoctor}
      >
        <div className="space-y-3">
          {selectedPatient?.assignedDoctor ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Assigned Doctor:</p>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium mr-2">
                  {selectedPatient.assignedDoctor.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="font-medium">Dr. {selectedPatient.assignedDoctor.name || 'Unknown Doctor'}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPatient.assignedDoctor.specialization || 'General'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 rounded-md text-yellow-700">
              <p>Please assign a doctor to this patient before booking an appointment.</p>
            </div>
          )}
          
          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                className="w-full border p-2 rounded"
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea
              rows="3"
              className="w-full border p-2 rounded"
              placeholder="e.g., General Checkup"
              value={appointmentForm.reason}
              onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Doctor Assignment Modal */}
      <Modal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        title="Update Assigned Doctor"
        onSave={handleUpdateDoctor}
        saveText="Update Doctor"
        disabled={isLoading || !editingPatient?.assignedDoctor?._id}
      >
        {editingPatient && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Patient: {editingPatient.name}</h3>
              <p className="text-sm text-gray-600">Current Doctor: {editingPatient.assignedDoctor?.name || 'Not assigned'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign New Doctor
              </label>
              <select
                className="w-full p-2 border rounded"
                value={editingPatient.assignedDoctor?._id || ''}
                onChange={(e) => {
                  const doctorId = e.target.value;
                  const selectedDoctor = doctors.find(d => d._id === doctorId);
                  setEditingPatient({
                    ...editingPatient,
                    assignedDoctor: selectedDoctor
                  });
                }}
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} ({doctor.specialization || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        title="Confirm Delete"
        onSave={handleDeleteConfirm}
        saveText="Delete"
        disabled={isLoading}
      >
        <div className="text-gray-700">
          <p>Are you sure you want to delete patient <strong>{deleteConfirmation.patientName}</strong>?</p>
          <p className="mt-2 text-red-600">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ReceptionistDashboard;
