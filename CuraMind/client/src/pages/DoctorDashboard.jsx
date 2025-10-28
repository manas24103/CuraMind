import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OverviewCards from './DoctorDashboard/OverviewCards';
import AppointmentsTable from './DoctorDashboard/AppointmentsTable';
import RecentPrescriptions from './DoctorDashboard/RecentPrescriptions';
import PrescriptionAI from './DoctorDashboard/PrescriptionAI';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) {
      navigate('/doctor-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    navigate('/doctor-login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container-fluid bg-light py-5 mt-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-primary mb-0">Doctor Dashboard</h3>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
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
