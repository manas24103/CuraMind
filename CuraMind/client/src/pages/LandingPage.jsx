import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Header />
      {/* ======= Hero Section ======= */}
      <section
        id="hero"
        className="d-flex align-items-center justify-content-center text-center bg-light py-5"
        style={{ minHeight: '100vh', marginTop: '56px' }} // Add margin-top to account for fixed header
      >
        <div className="container" data-aos="fade-up">
          <h1 className="display-5 fw-bold text-primary">Advanced Healthcare</h1>
          <h2 className="text-secondary">Leading Healthcare Specialists</h2>
          <p className="mt-3 mb-4 text-muted">
            Advanced Medical Care for Your Family's Health. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
            pulvinar dapibus leo.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="#appointment" className="btn btn-primary px-4">
              Book Appointment
            </a>
            <a href="#doctors" className="btn btn-outline-primary px-4">
              Find a Doctor
            </a>
          </div>
        </div>
      </section>

      {/* ======= Info Boxes ======= */}
      <section className="container text-center my-5">
        <div className="row g-4">
          <div className="col-md-3">
            <div className="p-4 border rounded shadow-sm">
              <h5>Emergency Line</h5>
              <p className="fw-bold text-primary mb-0">+1 (555) 987-6543</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 border rounded shadow-sm">
              <h5>Working Hours</h5>
              <p className="mb-0">Mon - Fri: 8AM - 8PM</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 border rounded shadow-sm">
              <h5>Cardiology</h5>
              <p className="text-muted small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 border rounded shadow-sm">
              <h5>Pulmonology</h5>
              <p className="text-muted small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======= About Section ======= */}
      <section className="bg-white py-5">
        <div className="container" data-aos="fade-up">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <img
                src="https://bootstrapmade.com/demo/templates/Medilab/assets/img/about.jpg"
                alt="Modern Facility"
                className="img-fluid rounded"
              />
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              <h3 className="fw-bold">Modern Healthcare Facility</h3>
              <h5 className="text-primary mb-3">25+ Years of Excellence</h5>
              <p>
                Committed to Exceptional Patient Care. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
                pulvinar dapibus leo.
              </p>
              <ul className="list-unstyled">
                <li>✅ Compassionate Care</li>
                <li>✅ Medical Excellence</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======= Departments Section ======= */}
      <section id="departments" className="py-5 bg-light">
        <div className="container" data-aos="fade-up">
          <h2 className="text-center fw-bold mb-5">Featured Departments</h2>
          <div className="row g-4">
            {[
              ["Cardiology", "Comprehensive cardiovascular care."],
              ["Neurology", "Expert care for brain and nervous system disorders."],
              ["Orthopedics", "Musculoskeletal treatment and surgeries."],
              ["Pediatrics", "Complete child healthcare and wellness."],
              ["Oncology", "Advanced cancer care with modern techniques."],
              ["Emergency", "24/7 emergency and trauma services."]
            ].map(([title, desc], i) => (
              <div className="col-md-4" key={i}>
                <div className="p-4 bg-white rounded shadow-sm h-100">
                  <h5 className="text-primary">{title}</h5>
                  <p className="text-muted small">{desc}</p>
                  <a href="#learn-more" className="text-decoration-none text-primary">
                    Learn More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= Services Section ======= */}
      <section id="services" className="py-5">
        <div className="container" data-aos="fade-up">
          <h2 className="text-center fw-bold mb-5">Featured Services</h2>
          <div className="row g-4">
            {[
              ["Cardiology Excellence", "Advanced heart care & surgery"],
              ["Neurology & Brain Health", "Brain imaging, stroke & rehabilitation"],
              ["Orthopedic Surgery", "Joint replacement, sports medicine"],
              ["Emergency & Trauma Care", "Critical care and 24/7 support"]
            ].map(([title, desc], i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="p-4 border rounded h-100">
                  <i className="bi bi-heart-pulse fs-1 text-primary"></i>
                  <h6 className="mt-3">{title}</h6>
                  <p className="small text-muted">{desc}</p>
                  <a href="#learn" className="text-primary text-decoration-none">
                    Learn More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= Call to Action ======= */}
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <h3>Your Health is Our Priority</h3>
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="#appointment" className="btn btn-light">
              Book Appointment
            </a>
            <a href="#doctors" className="btn btn-outline-light">
              Find a Doctor
            </a>
          </div>
        </div>
      </section>

      {/* ======= Emergency Info ======= */}
      <section className="container my-5" data-aos="fade-up">
        <h3 className="text-center mb-4">Emergency Info</h3>
        <div className="row g-4">
          {[
            ["Emergency Room", "+1 (555) 123-4567", "Open 24/7"],
            ["Urgent Care", "+1 (555) 987-6543", "Mon-Sun: 7:00 AM - 10:00 PM"],
            ["Nurse Helpline", "+1 (555) 456-7890", "Available 24/7"],
            ["Poison Control", "1-800-222-1222", "Available 24/7"]
          ].map(([title, phone, hours], i) => (
            <div className="col-md-3" key={i}>
              <div className="p-4 border rounded text-center h-100">
                <h6 className="text-primary">{title}</h6>
                <p className="fw-bold mb-1">{phone}</p>
                <small className="text-muted">{hours}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;
