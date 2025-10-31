import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserCircle, FaSignOutAlt, FaHome, FaUserMd, FaCalendarAlt, FaFilePrescription, FaRobot, FaChevronDown } from 'react-icons/fa';
import OverviewCards from './DoctorDashboard/OverviewCards';
import AppointmentsTable from './DoctorDashboard/AppointmentsTable';
import RecentPrescriptions from './DoctorDashboard/RecentPrescriptions';
import PrescriptionAI from './DoctorDashboard/PrescriptionAI';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    const info = localStorage.getItem('doctorInfo');
    
    console.log('DoctorDashboard mounted', { token, hasInfo: !!info });
    
    if (!token) {
      console.log('No doctor token found, redirecting to login');
      navigate('/doctor-login');
    } else if (!info) {
      console.log('No doctor info found, redirecting to login');
      navigate('/doctor-login');
    }
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown-area')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorInfo');
    navigate('/doctor-login');
  };

  const navigateToProfile = () => {
    // You can implement profile navigation here
    navigate('/doctor/profile');
    setShowDropdown(false);
  };

  const navigateToHome = () => {
    navigate('/doctor/dashboard');
    setShowDropdown(false);
  };

  // Get doctor's name from localStorage or use a default
  const doctorName = doctorInfo?.name || 'Doctor';
  const doctorEmail = doctorInfo?.email || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with User Dropdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, {doctorName}</p>
            </div>
            
            {/* User Dropdown */}
            <div className="relative dropdown-area">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FaUserCircle className="h-6 w-6 text-gray-500" />
                <span className="font-medium text-gray-700">{doctorName}</span>
                <FaChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{doctorName}</p>
                    <p className="text-xs text-gray-500 truncate">{doctorEmail}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={navigateToHome}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FaHome className="mr-3 h-5 w-5 text-gray-400" />
                      Dashboard Home
                    </button>
                    <button
                      onClick={navigateToProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FaUserCircle className="mr-3 h-5 w-5 text-gray-400" />
                      My Profile
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', icon: <FaUserMd className="mr-2 h-4 w-4" />, label: 'Overview' },
                { id: 'appointments', icon: <FaCalendarAlt className="mr-2 h-4 w-4" />, label: 'Appointments' },
                { id: 'prescriptions', icon: <FaFilePrescription className="mr-2 h-4 w-4" />, label: 'Prescriptions' },
                { id: 'ai', icon: <FaRobot className="mr-2 h-4 w-4" />, label: 'AI Assistant' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {activeTab === "overview" && <OverviewCards />}
            {activeTab === "appointments" && <AppointmentsTable />}
            {activeTab === "prescriptions" && <RecentPrescriptions />}
            {activeTab === "ai" && <PrescriptionAI />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
