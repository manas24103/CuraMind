import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserCircle, FaSignOutAlt, FaHome } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
    if (!token) {
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container-fluid bg-light py-5 mt-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-primary mb-0">Doctor Dashboard</h3>
            <div className="dropdown-area position-relative">
              <button 
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUserCircle size={20} />
                <span>{doctorInfo.name || 'Doctor'}</span>
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2" style={{ minWidth: '200px' }}>
                  <div className="dropdown-header fw-bold text-muted small">Welcome, {doctorInfo.name || 'Doctor'}</div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={navigateToHome}
                  >
                    <FaHome /> Home
                  </button>
                  <button 
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={navigateToProfile}
                  >
                    <FaUserCircle /> My Profile
                  </button>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            {["overview", "appointments", "prescriptions", "ai"].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? "active fw-bold" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview"
                    ? "Overview"
                    : tab === "appointments"
                    ? "Appointments"
                    : tab === "prescriptions"
                    ? "Prescriptions"
                    : "AI Generator"}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && <OverviewCards />}
            {activeTab === "appointments" && <AppointmentsTable />}
            {activeTab === "prescriptions" && <RecentPrescriptions />}
            {activeTab === "ai" && <PrescriptionAI />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorDashboard;
