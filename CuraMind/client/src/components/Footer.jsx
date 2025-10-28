import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5>MediTrust</h5>
            <p className="text-muted">
              A108 Adam Street, New York, NY 535022<br />
              United States
            </p>
            <p className="mb-1">
              <strong>Phone:</strong> +1 5589 55488 55
            </p>
            <p>
              <strong>Email:</strong> info@example.com
            </p>
            <div className="social-links mt-3">
              <a href="#" className="text-white me-2">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white me-2">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white me-2">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <h6>Useful Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> About us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Services
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/doctors" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Doctors
                </Link>
              </li>
              <li>
                <Link to="/departments" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Departments
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-6">
            <h6>Our Services</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Web Design
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Web Development
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Product Management
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Marketing
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  <i className="bi bi-chevron-right me-1"></i> Graphic Design
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h6>Our Newsletter</h6>
            <p className="text-muted">
              Subscribe to our newsletter for health tips and updates.
            </p>
            <form className="mt-3">
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your Email"
                  aria-label="Your Email"
                />
                <button className="btn btn-primary" type="button">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mt-4 pt-4 border-top">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            &copy; {currentYear} <strong>MediTrust</strong>. All Rights Reserved
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="credits">
              Designed by <a href="#">YourCompany</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
