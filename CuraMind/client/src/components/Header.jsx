import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaHospital, FaPhoneAlt, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Helper function to determine if a NavLink is active
const getNavLinkClass = ({ isActive }) => 
  isActive 
    ? 'text-primary-600 font-medium relative after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[70%] after:h-0.5 after:bg-primary-600' 
    : 'text-gray-700 hover:text-primary-600 transition-colors duration-200';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <header 
      className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] md:max-w-6xl mx-auto transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg rounded-full py-2 px-6' 
          : 'bg-white/90 backdrop-blur-sm shadow-md rounded-2xl py-2 px-4'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo/Brand Section */}
        <Link 
          to="/" 
          className="flex items-center text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
        >
          <FaHospital className="text-primary-500 mr-2" size={24} />
          <span>MediTrust</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" className={({ isActive }) => 
            `px-4 py-2 ${getNavLinkClass({ isActive })}`}
            end
          >
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 
            `px-4 py-2 ${getNavLinkClass({ isActive })}`}
          >
            About
          </NavLink>
          <NavLink to="/departments" className={({ isActive }) => 
            `px-4 py-2 ${getNavLinkClass({ isActive })}`}
          >
            Departments
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => 
            `px-4 py-2 ${getNavLinkClass({ isActive })}`}
          >
            Services
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => 
            `px-4 py-2 ${getNavLinkClass({ isActive })}`}
          >
            Doctors
          </NavLink>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              More
              <FaChevronDown className={`ml-1 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} size={14} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50">
                <Link
                  to="/pricing"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/faq"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  FAQ
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <Link
                  to="/privacy"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Privacy Policy
                </Link>
              </div>
            )}
          </div>
            
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-primary-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

          {/* Mobile Menu */}
          <div
            className={`mobile-menu-container ${
              isOpen ? 'block' : 'hidden'
            } md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-2xl py-4 px-6 z-50`}
          >
            <nav className="flex flex-col space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) => `block py-3 px-4 rounded-lg ${
                  isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
                end
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `block py-3 px-4 rounded-lg ${
                  isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/departments"
                className={({ isActive }) => `block py-3 px-4 rounded-lg ${
                  isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Departments
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) => `block py-3 px-4 rounded-lg ${
                  isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Services
              </NavLink>
              <NavLink
                to="/doctors"
                className={({ isActive }) => `block py-3 px-4 rounded-lg ${
                  isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Doctors
              </NavLink>
              
              <div className="border-t border-gray-100 my-2"></div>
              
              <div className="px-4 py-2 text-sm font-medium text-gray-500">MORE</div>
              
              <NavLink
                to="/pricing"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </NavLink>
              <NavLink
                to="/faq"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </NavLink>
              <NavLink
                to="/privacy"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Privacy Policy
              </NavLink>
              
              <div className="border-t border-gray-100 my-2"></div>
              
              <div className="pt-2">
                <NavLink
                  to="/login"
                  className="block py-3 px-3 text-center text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </NavLink>
              </div>
            </nav>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink 
              to="/login" 
              className="px-4 py-2 text-primary-600 hover:text-primary-600 font-medium transition-colors"
            >
              Login
            </NavLink>
          </div>
        </div>
      </header>
    );
  };
  
  export default Header;
