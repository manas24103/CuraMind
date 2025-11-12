import React, { useEffect, useState, useCallback } from "react";
import {
  FaUserMd,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarPlus,
  FaSyncAlt,
  FaSearch,
  FaPhoneAlt,
  FaEnvelope,
  FaUserInjured,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaHome,
  FaCity,
  FaGlobeAsia,
  FaLandmark,
  FaStethoscope,
  FaExclamationTriangle,
  FaNotesMedical,
  FaInfoCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { patientAPI, doctorAPI, receptionistAPI, appointmentAPI } from "../../services/api";

// Initialize default form data
const DEFAULT_PATIENT_DATA = {
  name: "",
  age: "",
  gender: "male",
  phone: "",
  email: "",
  bloodGroup: "",
  address: { 
    street: "", 
    city: "", 
    state: "", 
    pincode: "" 
  },
  medicalHistory: [],
  assignedDoctor: null
};

const DEFAULT_APPOINTMENT_DATA = {
  date: new Date().toISOString().split("T")[0],
  time: "",
  reason: "",
  status: "scheduled"
};

// =======================
// Inline Modal Component
// =======================
const Modal = ({ isOpen, onClose, title, onSave, saveText, disabled, children, className = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-5xl my-8 relative max-h-[90vh] flex flex-col ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="space-y-6">{children}</div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          {onSave && (
            <button
              onClick={onSave}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saveText || 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =======================
// Inline Tab Component
// =======================
const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium border-b-2 transition ${
      active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"
    }`}
  >
    {children}
  </button>
);

// =======================
// Main Receptionist Dashboard
// =======================
const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  // States
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("patients");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Patient Modal
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientFormData, setPatientFormData] = useState(DEFAULT_PATIENT_DATA);

  // Appointment Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState(DEFAULT_APPOINTMENT_DATA);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Edit Doctor Modal
  const [editingPatient, setEditingPatient] = useState(null);

  // Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    patientId: null,
    patientName: "",
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({});

  // ============================
  // FETCH FUNCTIONS
  // ============================
  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getPatients();
      // The patients array is in res.data.data
      const patientsData = res.data?.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load patients");
      setPatients([]); // Ensure patients is set to empty array on error
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await doctorAPI.getDoctors();
      
      // Check the structure of the response
      let doctorsData = [];
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        // If the response is already an array
        doctorsData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        // If the response has a data property that's an array
        doctorsData = res.data.data;
      } else if (res.data && res.data.success && Array.isArray(res.data.doctors)) {
        // If the response has a doctors array
        doctorsData = res.data.doctors;
      }
      
      // Make sure each doctor has an _id field
      const validDoctors = doctorsData.map(doctor => ({
        ...doctor,
        // Use id if _id is not present
        _id: doctor._id || doctor.id
      })).filter(doctor => doctor._id); // Only keep doctors with an ID
      
      setDoctors(validDoctors);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load doctors");
      setDoctors([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAppointments();
      
      // Handle different response structures
      let appointmentsData = [];
      
      if (Array.isArray(res.data)) {
        appointmentsData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        appointmentsData = res.data.data;
      } else if (res.data && res.data.success && Array.isArray(res.data.appointments)) {
        appointmentsData = res.data.appointments;
      } else if (res.data && Array.isArray(res.data)) {
        appointmentsData = res.data; // Handle case where data is directly the array
      }
      
      const processedAppointments = appointmentsData.map(appt => ({
        ...appt,
        reason: appt.reason || appt.reason === '' ? appt.reason : 'General Checkup'
      }));
      
      setAppointments(processedAppointments);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load appointments");
      setAppointments([]);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchPatients(),
        fetchDoctors(),
        fetchAppointments()
      ]);
    } catch (error) {
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================
  // HANDLERS
  // ============================
  const handleAddPatient = () => {
    // Reset form data with default values
    setPatientFormData(DEFAULT_PATIENT_DATA);
    setFormErrors({});
    setShowPatientModal(true);
    setEditingPatient(null);
  };

  const validateForm = (data) => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Patient name is required';
    }
    
    if (!data.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9\-\+\s]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!data.age) {
      errors.age = 'Age is required';
    } else if (isNaN(data.age) || data.age < 0 || data.age > 120) {
      errors.age = 'Please enter a valid age (0-120)';
    }
    
    // Address validation
    if (!data.address?.street?.trim()) {
      errors['address.street'] = 'Street address is required';
    }
    
    if (!data.address?.city?.trim()) {
      errors['address.city'] = 'City is required';
    }
    
    if (!data.address?.state?.trim()) {
      errors['address.state'] = 'State is required';
    }
    
    if (!data.address?.pincode?.trim()) {
      errors['address.pincode'] = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(data.address.pincode)) {
      errors['address.pincode'] = 'Pincode must be 6 digits';
    }
    
    return errors;
  };

  const handleCreatePatient = async () => {
    // Validate form
    const errors = validateForm(patientFormData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return; // Don't proceed if there are validation errors
    }

    try {
      setIsLoading(true);
      
      // Prepare the patient data with required fields
      const patientData = {
        name: patientFormData.name.trim(),
        age: parseInt(patientFormData.age, 10) || 0,
        gender: patientFormData.gender || 'male',
        phone: patientFormData.phone.trim(),
        email: patientFormData.email.trim(),
        bloodGroup: patientFormData.bloodGroup || undefined,
        address: {
          street: patientFormData.address.street.trim(),
          city: patientFormData.address.city.trim(),
          state: patientFormData.address.state.trim(),
          pincode: patientFormData.address.pincode.trim()
        },
        assignedDoctor: patientFormData.assignedDoctor || undefined
      };
      await patientAPI.createPatient(patientData);
      toast.success("Patient added successfully!");
      setShowPatientModal(false);
      await fetchPatients(); // Refresh the patient list
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add patient";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (patient) => {
    setDeleteConfirmation({
      isOpen: true,
      patientId: patient._id,
      patientName: patient.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.patientId) return;
    try {
      setIsLoading(true);
      await patientAPI.deletePatient(deleteConfirmation.patientId);
      toast.success("Patient deleted");
      fetchPatients();
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setDeleteConfirmation({ isOpen: false, patientId: null, patientName: "" });
      setIsLoading(false);
    }
  };

  const handleBookClick = (patient) => {
    if (!patient?._id) {
      toast.error("Invalid patient data");
      return;
    }
    
    setSelectedPatient(patient);
    setAppointmentForm({
      ...DEFAULT_APPOINTMENT_DATA,
      date: new Date().toISOString().split("T")[0]
    });
    setShowBookModal(true);
  };

  const validateAppointment = (data) => {
    const errors = {};
    
    if (!data.time || !data.time.trim()) {
      errors.time = 'Please select a time for the appointment';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
      errors.time = 'Please enter a valid time in 24-hour format (HH:MM)';
    }
    
    if (!data.date) {
      errors.date = 'Please select a date for the appointment';
    }
    
    if (!data.reason?.trim()) {
      errors.reason = 'Please provide a reason for the appointment';
    }
    
    return errors;
  };

  const handleBookAppointment = async () => {
    if (!selectedPatient?._id) {
      toast.error("No patient selected");
      return;
    }
    
    if (!selectedPatient?.assignedDoctor?._id) {
      toast.error("Please assign a doctor to the patient first");
      return;
    }
    
    // Validate appointment form
    const errors = validateAppointment(appointmentForm);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    try {
      setIsLoading(true);
      
      // Ensure time is properly formatted
      if (!appointmentForm.time) {
        throw new Error('Appointment time is required');
      }
      
      // Format the date and time properly
      const [hours, minutes] = appointmentForm.time.split(':');
      if (!hours || !minutes) {
        throw new Error('Invalid time format. Please use HH:MM format');
      }
      
      const appointmentDate = new Date(appointmentForm.date);
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      
      // Prepare the appointment data - match server controller expected fields
      const appointmentData = {
        patient: selectedPatient._id,  // Changed from patientId to patient
        doctor: selectedPatient.assignedDoctor._id,  // Changed from doctorId to doctor
        date: appointmentForm.date,
        time: appointmentForm.time,
        reason: appointmentForm.reason || "General Checkup",
        status: 'scheduled'  // Explicitly set status as required by the model
      };
      
      // Send the request to create the appointment
      const response = await appointmentAPI.createAppointment(appointmentData);
      
      if (response.data) {
        toast.success("Appointment booked successfully!");
        setShowBookModal(false);
        // Reset the form
        setAppointmentForm(DEFAULT_APPOINTMENT_DATA);
        // Refresh the appointments list
        await fetchAppointments();
      } else {
        throw new Error('No data in response');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to book appointment';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (patient) => {
    if (!patient?._id) {
      toast.error("Invalid patient data");
      return;
    }
    
    // Create a deep copy of the patient data to avoid reference issues
    const patientCopy = JSON.parse(JSON.stringify(patient));
    setEditingPatient(patientCopy);
    
    // Don't show the patient form, just set the editing patient
    // The modal for editing doctor will be shown based on editingPatient state
  };

  const handleUpdateDoctor = async () => {
    if (!editingPatient?.assignedDoctor?._id) {
      toast.error("Select a valid doctor");
      return;
    }
    try {
      setIsLoading(true);
      await receptionistAPI.assignDoctorToPatient(
        editingPatient._id,
        editingPatient.assignedDoctor._id
      );
      toast.success("Doctor updated");
      setEditingPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
          <FaUserMd /> Receptionist Dashboard
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </div>
    </nav>

    {/* Main Content */}
    <div className="flex-1 overflow-auto py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b flex gap-2">
          <Tab active={activeTab === "patients"} onClick={() => setActiveTab("patients")}>
            Patients
          </Tab>
          <Tab active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")}>
            Appointments
          </Tab>
        </div>

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white mt-4 rounded-lg shadow">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Patients List</h3>
              <button
                onClick={handleAddPatient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FaPlus className="mr-2" /> Add Patient
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Search and Add Patient */}
              <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
                  <p className="text-sm text-gray-500">Manage all patient information in one place</p>
                </div>
                <div className="w-full sm:w-96">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Patient List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
                        </td>
                      </tr>
                    ) : patients.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaUserInjured className="h-12 w-12 mb-3 opacity-30" />
                            <h4 className="text-lg font-medium text-gray-500">No patients found</h4>
                            <p className="mt-1 text-sm">
                              {searchTerm 
                                ? 'No patients match your search. Try different keywords.'
                                : 'Get started by adding a new patient.'}
                            </p>
                            {!searchTerm && (
                              <button
                                onClick={handleAddPatient}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                                Add First Patient
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      patients.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          {/* Patient Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Contact Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <a href={`tel:${p.phone}`} className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
                                <FaPhoneAlt className="h-3 w-3 mr-1.5 text-gray-400" />
                                {p.phone || "—"}
                              </a>
                            </div>
                            {p.email && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                <a href={`mailto:${p.email}`} className="flex items-center hover:text-gray-700">
                                  <FaEnvelope className="h-3 w-3 mr-1.5 text-gray-400" />
                                  {p.email}
                                </a>
                              </div>
                            )}
                          </td>
                          
                          {/* Patient Details */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                p.gender === 'male' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : p.gender === 'female' 
                                    ? 'bg-pink-100 text-pink-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : "—"}
                              </span>
                              {p.age && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-900">{p.age} years</span>
                                </>
                              )}
                              {p.bloodGroup && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm font-medium text-gray-900">{p.bloodGroup}</span>
                                </>
                              )}
                            </div>
                            {p.assignedDoctor && (
                              <div className="mt-1 text-xs text-gray-500 flex items-center">
                                <FaUserMd className="h-3 w-3 mr-1.5 text-purple-400" />
                                {p.assignedDoctor.name ? `Dr. ${p.assignedDoctor.name}` : 'Doctor assigned'}
                              </div>
                            )}
                          </td>
                          
                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => handleBookClick(p)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                title="Book Appointment"
                              >
                                <FaCalendarPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => confirmDelete(p)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination (you can implement this later) */}
              {patients.length > 0 && (
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, patients.length)}</span> of{' '}
                        <span className="font-medium">{patients.length}</span> patients
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Previous</span>
                          <FaChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-gray-50">
                          1
                        </button>
                        {patients.length > 10 && (
                          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            2
                          </button>
                        )}
                        {patients.length > 20 && (
                          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            3
                          </button>
                        )}
                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Next</span>
                          <FaChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                <p className="text-sm text-gray-500">View and manage all appointments</p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSyncAlt className="mr-1.5 h-3 w-3" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                          <p className="text-sm">Loading appointments...</p>
                        </div>
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <FaCalendarPlus className="h-12 w-12 mb-3 opacity-30" />
                          <h4 className="text-lg font-medium text-gray-500">No appointments found</h4>
                          <p className="mt-1 text-sm">
                            No appointments have been scheduled yet.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => { 
                      // Safely access nested properties with fallbacks
                      const patientName = appointment?.patient?.name || 'N/A';
                      const patientPhone = appointment?.patient?.phone || '';
                      const doctorName = appointment?.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'N/A';
                      const doctorSpecialization = appointment?.doctor?.specialization || '';
                      const appointmentDate = appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A';
                      const appointmentTime = appointment?.time || '';
                      const reason = appointment?.reason || 'General Checkup';
                      const status = appointment?.status?.toLowerCase() || 'scheduled';
                      
                      return (
                        <tr key={appointment._id || Math.random()} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {patientName}
                            </div>
                            {patientPhone && (
                              <div className="text-xs text-gray-500">
                                {patientPhone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {doctorName}
                            </div>
                            {doctorSpecialization && (
                              <div className="text-xs text-gray-500">
                                {doctorSpecialization}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointmentDate}
                            </div>
                            {appointmentTime && (
                              <div className="text-sm text-gray-500">
                                {appointmentTime}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={reason}>
                              {reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                              status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {status}
                            </span>
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
        {/* Patient Modal */}
        <Modal
          isOpen={showPatientModal}
          onClose={() => setShowPatientModal(false)}
          title={editingPatient ? "Edit Patient" : "Add New Patient"}
          onSave={handleCreatePatient}
          saveText={editingPatient ? "Save Changes" : "Add Patient"}
          disabled={isLoading}
          className="w-full max-w-5xl">
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaUserCircle className="mr-2 text-blue-600" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                <input
                  placeholder="John Doe"
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={patientFormData.name}
                  onChange={(e) => setPatientFormData({ ...patientFormData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="30"
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={patientFormData.age}
                  onChange={(e) => setPatientFormData({ ...patientFormData, age: e.target.value })}
                  min="0"
                  max="120"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={patientFormData.gender}
                  onChange={(e) => setPatientFormData({ ...patientFormData, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={patientFormData.bloodGroup || ''}
                  onChange={(e) => setPatientFormData({ ...patientFormData, bloodGroup: e.target.value })}
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
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={patientFormData.phone}
                    onChange={(e) => setPatientFormData({ ...patientFormData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={patientFormData.email}
                    onChange={(e) => setPatientFormData({ ...patientFormData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              Address Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Street Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaHome className="text-gray-400" />
                  </div>
                  <input
                    placeholder="123 Main St, Apartment 4B"
                    className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={patientFormData.address?.street || ''}
                    onChange={(e) => setPatientFormData({
                      ...patientFormData,
                      address: { ...patientFormData.address, street: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaCity className="text-gray-400" />
                  </div>
                  <input
                    placeholder="Mumbai"
                    className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={patientFormData.address?.city || ''}
                    onChange={(e) => setPatientFormData({
                      ...patientFormData,
                      address: { ...patientFormData.address, city: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">State <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaGlobeAsia className="text-gray-400" />
                  </div>
                  <input
                    placeholder="Maharashtra"
                    className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={patientFormData.address?.state || ''}
                    onChange={(e) => setPatientFormData({
                      ...patientFormData,
                      address: { ...patientFormData.address, state: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Pincode <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaLandmark className="text-gray-400" />
                  </div>
                  <input
                    placeholder="400001"
                    className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={patientFormData.address?.pincode || ''}
                    onChange={(e) => setPatientFormData({
                      ...patientFormData,
                      address: { ...patientFormData.address, pincode: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Doctor Assignment Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaUserMd className="mr-2 text-purple-600" />
              Doctor Assignment
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Assigned Doctor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaStethoscope className="text-gray-400" />
                </div>
                <select
                  className="w-full border border-gray-300 pl-10 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={patientFormData.assignedDoctor || ''}
                  onChange={(e) => {
                    const selectedDoctorId = e.target.value || null;
                    setPatientFormData({ 
                      ...patientFormData, 
                      assignedDoctor: selectedDoctorId
                    });
                  }}
                  required
                  disabled={!Array.isArray(doctors) || doctors.length === 0}
                >
                  <option value="">
                    {Array.isArray(doctors) && doctors.length > 0 
                      ? 'Select a doctor (required)' 
                      : 'No doctors available'}
                  </option>
                  {Array.isArray(doctors) && doctors.map(doctor => {
                    const doctorId = doctor._id || doctor.id;
                    if (!doctorId) return null;
                    return (
                      <option key={doctorId} value={doctorId}>
                        Dr. {doctor.name} ({doctor.specialization || 'No specialization'})
                      </option>
                    );
                  })}
                </select>
              </div>
              {Array.isArray(doctors) && doctors.length === 0 && (
                <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 text-sm rounded-md flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  No doctors available. Please add doctors first to assign them to patients.
                </div>
              )}
            </div>
          </div>
          
          {/* Medical History - Can be added in a future update */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
              <FaNotesMedical className="mr-2 text-red-500" />
              Medical History
            </h4>
            <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600">
              <div className="flex items-center">
                <FaInfoCircle className="text-blue-500 mr-2 flex-shrink-0" />
                <p>Medical history can be added after patient creation. You'll be able to add past conditions, allergies, medications, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title={`Book Appointment for ${selectedPatient?.name || ""}`}
        onSave={handleBookAppointment}
        saveText="Book"
        disabled={isLoading}
      >
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={appointmentForm.date}
          onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
        />
        <div className="w-full">
          <input
            type="time"
            className="w-full border p-2 rounded"
            value={appointmentForm.time || ''}
            onChange={(e) => {
              console.log('Time input changed:', e.target.value);
              setAppointmentForm(prev => ({
                ...prev,
                time: e.target.value
              }));
            }}
            required
          />
          {!appointmentForm.time && (
            <p className="text-red-500 text-xs mt-1">Please select a time</p>
          )}
        </div>
        <textarea
          rows="3"
          placeholder="Reason"
          className="w-full border p-2 rounded"
          value={appointmentForm.reason}
          onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
        />
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        title="Update Assigned Doctor"
        onSave={handleUpdateDoctor}
        saveText="Update"
        disabled={isLoading}
      >
        {editingPatient && (
          <div className="w-full">
            <select
              className="w-full p-2 border rounded"
              value={editingPatient.assignedDoctor?._id || ""}
              onChange={(e) => {
                const doc = doctors.find((d) => d._id === e.target.value);
                setEditingPatient({ ...editingPatient, assignedDoctor: doc });
              }}
            >
              <option value="">Select Doctor</option>
              {Array.isArray(doctors) && doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, patientId: null, patientName: "" })}
        title="Confirm Delete"
        onSave={handleDeleteConfirm}
        saveText="Delete"
        disabled={isLoading}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{deleteConfirmation.patientName}</strong>?
        </p>
      </Modal>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
