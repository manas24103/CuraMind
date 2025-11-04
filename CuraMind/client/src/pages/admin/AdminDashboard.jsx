import React, { useState, useEffect } from "react";
import { patientAPI, doctorAPI, receptionistAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  FaUserMd,
  FaUserTie,
  FaUserInjured,
  FaSpinner,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaHome,
} from "react-icons/fa";

// ---------------- Modal Component ----------------
const Modal = React.memo(({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-hidden animate-fadeIn">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
});

// ---------------- Main Component ----------------
const AdminDashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [receptionists, setReceptionists] = useState([]);
  const [showReceptionistModal, setShowReceptionistModal] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [stats, setStats] = useState({ patients: 0, doctors: 0, receptionists: 0 });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [isLoading, setIsLoading] = useState({
    stats: true,
    doctors: true,
    patients: true,
    receptionists: true,
  });

  const adminInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".dropdown-area")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  // Update stats whenever receptionists, patients, or doctors arrays change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      patients: patients.length,
      doctors: doctors.length,
      receptionists: receptionists.length
    }));
  }, [receptionists, patients, doctors]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Set all loading states to true
        setIsLoading({ stats: true, doctors: true, patients: true, receptionists: true });
        
        // Fetch all data in parallel
        const [patientsRes, doctorsRes, receptionistsRes] = await Promise.all([
          patientAPI.getPatients().catch(error => {
            console.error('Error fetching patients:', error);
            return { data: { data: [] } }; // Return empty array on error with expected structure
          }),
          doctorAPI.getDoctors().catch(error => {
            console.error('Error fetching doctors:', error);
            return { data: { data: [] } }; // Return empty array on error with expected structure
          }),
          receptionistAPI.getReceptionists().catch(error => {
            console.error('Error fetching receptionists:', error);
            return { data: { data: [] } }; // Return empty array on error with expected structure
          })
        ]);
        
        // Update state with the response data
        setPatients(patientsRes?.data?.data || []);
        setDoctors(doctorsRes?.data?.data || []);
        setReceptionists(receptionistsRes?.data?.data || []);
        
      } catch (error) {
        console.error('Error in fetchDashboardData:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading({ stats: false, doctors: false, patients: false, receptionists: false });
      }
    };
    
    // Call the function to fetch data
    fetchDashboardData();
    
    // Cleanup function (optional)
    return () => {
      // Any cleanup code if needed
    };
  }, []); // Empty dependency array means this runs once on mount

  // ---------------- State for Receptionist Form ----------------
  const [receptionistForm, setReceptionistForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isActive: true
  });
  const [isEditingReceptionist, setIsEditingReceptionist] = useState(false);
  const [currentReceptionistId, setCurrentReceptionistId] = useState(null);

  // ---------------- Handlers ----------------
  const handleReceptionistFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReceptionistForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateOrUpdateReceptionist = async (e) => {
    e.preventDefault();
    try {
      if (isEditingReceptionist && currentReceptionistId) {
        // Update existing receptionist
        await receptionistAPI.updateReceptionist(currentReceptionistId, receptionistForm);
        // Refresh the receptionists list
        const receptionistsResponse = await receptionistAPI.getReceptionists();
        setReceptionists(receptionistsResponse.data?.data || []);
        toast.success("Receptionist updated successfully");
      } else {
        // Create new receptionist
        await receptionistAPI.createReceptionist(receptionistForm);
        // Refresh the receptionists list
        const receptionistsResponse = await receptionistAPI.getReceptionists();
        setReceptionists(receptionistsResponse.data?.data || []);
        toast.success("Receptionist created successfully");
      }
      
      // Reset form and close modal
      setReceptionistForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        isActive: true
      });
      setShowReceptionistModal(false);
      setIsEditingReceptionist(false);
      setCurrentReceptionistId(null);
    } catch (error) {
      console.error('Error saving receptionist:', error);
      toast.error(error.response?.data?.message || "Failed to save receptionist");
    }
  };

  const handleEditReceptionist = (receptionist) => {
    setReceptionistForm({
      name: receptionist.name || "",
      email: receptionist.email || "",
      password: "", // Don't pre-fill password for security
      phone: receptionist.phone || "",
      isActive: receptionist.isActive !== undefined ? receptionist.isActive : true
    });
    setIsEditingReceptionist(true);
    setCurrentReceptionistId(receptionist._id);
    setShowReceptionistModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    window.location.href = "/login";
  };

  const handleProfile = () => {
    toast.info("My Profile feature coming soon!");
    setShowDropdown(false);
  };

  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
    experience: "",
    profilePicture: "",
  });
  
  // Reset search and filters when switching between tabs
  useEffect(() => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      dateRange: { start: '', end: '' }
    });
  }, [showPatientDetails]);

  const handleDoctorFormChange = (e) =>
    setDoctorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const doctorData = { ...doctorForm, experience: Number(doctorForm.experience) };
      const response = await doctorAPI.createDoctor(doctorData);
      
      // After successful creation, refresh the doctors list
      const doctorsResponse = await doctorAPI.getDoctors();
      setDoctors(doctorsResponse.data?.data || []);
      
      // Reset form and close modal
      setDoctorForm({
        name: '',
        email: '',
        password: '',
        specialization: '',
        phone: '',
        experience: '',
        profilePicture: ''
      });
      setShowDoctorModal(false);
      toast.success("Doctor created successfully");
    } catch (err) {
      console.error('Error creating doctor:', err);
      toast.error(err.response?.data?.message || "Failed to create doctor");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!id) {
      toast.error('Error: Could not find doctor ID. Please try again.');
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await doctorAPI.deleteDoctor(id);
        setDoctors(prev => prev.filter(d => {
          // Handle both _id and id properties
          const doctorId = d?._id || d?.id;
          return doctorId !== id;
        }));
        toast.success("Doctor deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete doctor");
      }
    }
  };

  const handleDeleteReceptionist = async (id) => {
    if (!id) {
      toast.error('Error: No receptionist ID provided');
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this receptionist?")) {
      try {
        await receptionistAPI.deleteReceptionist(id);
        setReceptionists(prev => prev.filter(r => r._id !== id));
        toast.success("Receptionist deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete receptionist");
      }
    }
  };

  // ---------------- Filter and Search Functions ----------------
  const filterItems = (items, searchTerm, type) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.filter(item => {
      if (!item) return false;
      
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.name?.toLowerCase().includes(searchLower) ||
         item.email?.toLowerCase().includes(searchLower) ||
         item.phone?.includes(searchTerm) ||
         (type === 'doctors' && item.specialization?.toLowerCase().includes(searchLower)));
      
      // Status filter (only apply to receptionists)
      const matchesStatus = 
        type !== 'receptionists' || 
        filters.status === 'all' || 
        (filters.status === 'active' ? (item.isActive !== false) : (item.isActive === false));
      
      // Date range filter (if createdAt exists)
      let matchesDateRange = true;
      if (item.createdAt) {
        matchesDateRange = 
          !filters.dateRange.start || 
          (new Date(item.createdAt) >= new Date(filters.dateRange.start) && 
           (!filters.dateRange.end || new Date(item.createdAt) <= new Date(filters.dateRange.end)));
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  };

  // ---------------- UI Components ----------------
  const SearchBar = ({ placeholder, value, onChange }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const FilterDropdown = ({ value, onChange, options, label }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const DateRangePicker = ({ start, end, onStartChange, onEndChange }) => (
    <div className="flex space-x-2">
      <input
        type="date"
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      <span className="flex items-center">to</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );

  const StatCard = ({ label, count, icon: Icon, color, onViewAll }) => (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
            <Icon className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold">
              {isLoading.stats ? <FaSpinner className="animate-spin" /> : count}
            </p>
          </div>
        </div>
        {label === "Total Patients" && (
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showPatientDetails ? "Hide" : "View All"}
          </button>
        )}
      </div>
    </div>
  );

  // ---------------- JSX ----------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaHome /> Admin Dashboard
          </h1>

          {/* Profile Dropdown */}
          <div className="relative dropdown-area">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <FaUserCircle className="text-2xl" />
              </div>
              <span className="text-gray-700 font-medium hidden sm:inline">
                {adminInfo.name || "Admin"}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-800">{adminInfo.name || "Admin"}</p>
                  <p className="text-xs text-gray-500">{adminInfo.email || "admin@example.com"}</p>
                </div>
                <button
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaUserCircle className="mr-2" /> My Profile
                </button>
                <button
                  onClick={() => toast.info("Settings feature coming soon!")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaCog className="mr-2" /> Settings
                </button>
                <div className="border-t" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <StatCard 
          label="Total Patients" 
          count={stats.patients} 
          icon={FaUserInjured} 
          color="blue"
          onViewAll={() => setShowPatientDetails(!showPatientDetails)}
        />
        <StatCard 
          label="Total Doctors" 
          count={stats.doctors} 
          icon={FaUserMd} 
          color="green" 
        />
        <StatCard 
          label="Total Receptionists" 
          count={stats.receptionists} 
          icon={FaUserTie} 
          color="purple" 
        />
      </section>

      {/* Patients Table */}
      {showPatientDetails && (
        <section className="p-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Patients</h2>
            </div>
            {isLoading.patients ? (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin inline-block text-blue-500 text-2xl" />
                <p className="mt-2 text-gray-600">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No patients found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {patients.map(patient => (
                      <tr key={patient._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Receptionists Table */}
      <section className="p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800">Receptionists</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-64">
                  <SearchBar 
                    placeholder="Search by name, email, or phone..." 
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>
                <button
                  onClick={() => setShowReceptionistModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                >
                  Add Receptionist
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <FilterDropdown
                  value={filters.status}
                  onChange={(value) => setFilters({...filters, status: value})}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <DateRangePicker
                  start={filters.dateRange.start}
                  end={filters.dateRange.end}
                  onStartChange={(value) => setFilters({
                    ...filters, 
                    dateRange: { ...filters.dateRange, start: value }
                  })}
                  onEndChange={(value) => setFilters({
                    ...filters, 
                    dateRange: { ...filters.dateRange, end: value }
                  })}
                />
              </div>
            </div>
          </div>
          {isLoading.receptionists ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin inline-block text-blue-500 text-2xl" />
              <p className="mt-2 text-gray-600">Loading receptionists...</p>
            </div>
          ) : receptionists.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No receptionists found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filterItems(receptionists, searchTerm, 'receptionists').map(receptionist => (
                    <tr key={receptionist._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{receptionist.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{receptionist.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{receptionist.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${receptionist.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {receptionist.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditReceptionist(receptionist)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Receptionist"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteReceptionist(receptionist._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Receptionist"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Doctors Table */}
      <section className="p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl font-semibold text-gray-800">Doctors</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-64">
                <SearchBar 
                  placeholder="Search by name, email, or specialization..." 
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>
              <button
                onClick={() => setShowDoctorModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                Add Doctor
              </button>
            </div>
          </div>

          {isLoading.doctors ? (
            <div className="text-center py-8 text-gray-500">
              <FaSpinner className="animate-spin inline mr-2" />
              Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No doctors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-50">
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Specialization</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filterItems(doctors, searchTerm, 'doctors').map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{d.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{d.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{d.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{d.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const doctorId = d?._id || d?.id;
                            if (!d || !doctorId) {
                              console.error('Invalid doctor data - missing ID:', d);
                              toast.error('Error: Could not find doctor ID');
                              return;
                            }
                            handleDeleteDoctor(doctorId);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Doctor"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Add/Edit Doctor Modal */}
      <Modal isOpen={showDoctorModal} onClose={() => setShowDoctorModal(false)} title="Add New Doctor">
        <form onSubmit={handleCreateDoctor} className="space-y-5">
          {[
            { label: "Full Name", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Specialization", name: "specialization", type: "text" },
            { label: "Phone", name: "phone", type: "tel" },
            { label: "Experience (years)", name: "experience", type: "number" },
            { label: "Profile Picture URL", name: "profilePicture", type: "url" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={doctorForm[name]}
                onChange={handleDoctorFormChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                required={name !== "phone" && name !== "profilePicture"}
              />
            </div>
          ))}
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowDoctorModal(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
              Create Doctor
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Receptionist Modal */}
      <Modal 
        isOpen={showReceptionistModal} 
        onClose={() => {
          setShowReceptionistModal(false);
          setIsEditingReceptionist(false);
          setCurrentReceptionistId(null);
          setReceptionistForm({
            name: "",
            email: "",
            password: "",
            phone: "",
            isActive: true
          });
        }} 
        title={isEditingReceptionist ? "Edit Receptionist" : "Add New Receptionist"}
      >
        <form onSubmit={handleCreateOrUpdateReceptionist} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={receptionistForm.name}
              onChange={handleReceptionistFormChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={receptionistForm.email}
              onChange={handleReceptionistFormChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditingReceptionist ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              name="password"
              value={receptionistForm.password}
              onChange={handleReceptionistFormChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
              required={!isEditingReceptionist}
              minLength={isEditingReceptionist ? 0 : 6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={receptionistForm.phone}
              onChange={handleReceptionistFormChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={receptionistForm.isActive}
              onChange={handleReceptionistFormChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => {
                setShowReceptionistModal(false);
                setIsEditingReceptionist(false);
                setCurrentReceptionistId(null);
                setReceptionistForm({
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  isActive: true
                });
              }}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEditingReceptionist ? 'Update' : 'Create'} Receptionist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
