import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

const Appointment = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    doctor: "",
    date: "",
    message: "",
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add API call here
  };

  return (
    <>
      {/* ======= Header ======= */}
      <Header />

      {/* ======= Page Title Section ======= */}
      <section className="bg-light py-5 mt-5 text-center">
        <div className="container" data-aos="fade-up">
          <h2 className="fw-bold text-primary">Appointment</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mt-3">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <a href="#category" className="text-decoration-none">Category</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Appointment
              </li>
            </ol>
          </nav>
          <p className="text-muted mt-3">
            Book your appointment with our specialists. Fill out the form below and we'll get back to you shortly.
          </p>
        </div>
      </section>

      {/* ======= Appointment Info Section ======= */}
      <section className="container my-5">
        <div className="text-center mb-5" data-aos="fade-up">
          <h3 className="fw-bold text-primary">Quick & Easy Online Booking</h3>
          <p className="text-muted">
            Book your appointment in just a few simple steps. Our healthcare professionals are ready to provide you with the best medical care tailored to your needs.
          </p>
        </div>

        <div className="row g-4" data-aos="fade-up">
          {[
            ["Flexible Scheduling", "Choose from available time slots that fit your busy schedule"],
            ["Quick Response", "Get confirmation within 15 minutes of submitting your request"],
            ["Expert Medical Care", "Board-certified doctors and specialists at your service"],
            ["Emergency Hotline", "Call +1 (555) 911-4567 for urgent medical assistance"]
          ].map(([title, desc], i) => (
            <div className="col-md-6 col-lg-3" key={i}>
              <div className="border p-4 rounded h-100 text-center">
                <h6 className="text-primary fw-bold">{title}</h6>
                <p className="small text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= Appointment Form ======= */}
      <section className="bg-light py-5">
        <div className="container" data-aos="fade-up">
          <h4 className="fw-bold text-center mb-4">Book Appointment</h4>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <form onSubmit={handleSubmit} className="row g-3 bg-white p-4 rounded shadow-sm">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Your Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter full name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Your Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Enter email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Your Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="Enter phone number" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Select Department</label>
                  <select 
                    className="form-select" 
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Preferred Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Select Doctor</label>
                  <select 
                    className="form-select" 
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose Doctor</option>
                    <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</option>
                    <option value="Dr. Michael Rodriguez">Dr. Michael Rodriguez</option>
                    <option value="Dr. Emily Chen">Dr. Emily Chen</option>
                    <option value="Dr. James Thompson">Dr. James Thompson</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">
                    Describe your symptoms or reason for visit (optional)
                  </label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Type your message here..."
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="col-12 text-center mt-3">
                  <button type="submit" className="btn btn-primary px-5">
                    Submit Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ======= Steps Section ======= */}
      <section className="container my-5" data-aos="fade-up">
        <h4 className="fw-bold text-center mb-5">How It Works</h4>
        <div className="row g-4">
          {[
            ["1", "Fill Details", "Provide your personal information and select your preferred department"],
            ["2", "Choose Date", "Select your preferred date and time slot from available options"],
            ["3", "Confirmation", "Receive instant confirmation and appointment details via email or SMS"],
            ["4", "Get Treatment", "Visit our clinic at your scheduled time and receive quality healthcare"]
          ].map(([num, title, desc], i) => (
            <div className="col-md-6 col-lg-3 text-center" key={i}>
              <div className="p-4 border rounded h-100">
                <div className="display-6 fw-bold text-primary mb-2">{num}</div>
                <h6 className="fw-bold">{title}</h6>
                <p className="small text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= Footer ======= */}
      <Footer />
    </>
  );
};

export default Appointment;
