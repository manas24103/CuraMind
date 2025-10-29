import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  
  // Show/hide back-to-top button on scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 w-full mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Contact Info & Brand */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-800">MediTrust</h4>
            <address className="text-sm text-gray-600 not-italic space-y-2">
              <p>123 Medical Center Drive</p>
              <p>New Delhi, 110001</p>
              <p>
                <span className="font-medium">Emergency:</span> +91 91111 91111
              </p>
              <p>
                <span className="font-medium">Appointments:</span> +91 98765 43210
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a 
                  href="mailto:info@meditrust.com" 
                  className="text-primary-600 hover:text-primary-800 transition-colors"
                >
                  info@meditrust.com
                </a>
              </p>
            </address>
            
            {/* Social Media Links */}
            <div className="flex space-x-3 pt-2">
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={14} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={14} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/doctors" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link 
                  to="/appointment" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link 
                  to="/departments" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Departments
                </Link>
              </li>
              <li>
                <Link 
                  to="/patient-info" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Patient Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-4">Our Services</h5>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/services/emergency" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Emergency Care
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/primary-care" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Primary Care
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/specialty-care" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Specialty Care
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/diagnostics" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Diagnostics
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/wellness" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Wellness Programs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Health Info */}
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-4">Health Information</h5>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/health-articles" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Health Articles
                </Link>
              </li>
              <li>
                <Link 
                  to="/preventive-care" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Preventive Care
                </Link>
              </li>
              <li>
                <Link 
                  to="/patient-education" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  Patient Education
                </Link>
              </li>
              <li>
                <Link 
                  to="/covid-19" 
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors block py-1"
                >
                  COVID-19 Updates
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} MediTrust. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <FaArrowUp />
      </button>
    </footer>
  );
}

export default Footer;
