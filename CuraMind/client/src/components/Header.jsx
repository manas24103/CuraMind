import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { FaHospital, FaPhoneAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Header.css'; // We'll create this file next

// Helper function to determine if a NavLink is active
const getNavLinkClass = ({ isActive }) => 
  isActive ? 'nav-link active' : 'nav-link';

function Header() {
  const navigate = useNavigate();

  // Handle appointment button click
  const handleAppointmentClick = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login to book an appointment');
      navigate('/login');
      return;
    }
    navigate('/appointment');
  };

  return (
    <Navbar 
      expand="lg" 
      className="navbar-custom"
      sticky="top"
    >
      <Container>
        {/* Logo/Brand Section */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaHospital className="text-info me-2" size={24} />
          <span className="fw-bold fs-4 text-primary">MediTrust</span> 
        </Navbar.Brand>
        
        {/* Toggler for mobile responsiveness */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Main Navigation Links */}
          <Nav className="mx-auto">
            <Nav.Item>
              <NavLink to="/" className={getNavLinkClass} end>Home</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/about" className={getNavLinkClass}>About</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/departments" className={getNavLinkClass}>Departments</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/services" className={getNavLinkClass}>Services</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/doctors" className={getNavLinkClass}>Doctors</NavLink>
            </Nav.Item>
            
            {/* Dropdown Menu */}
            <NavDropdown title="More" id="more-pages-dropdown">
              <NavDropdown.Item as={Link} to="/pricing">Pricing</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/faq">FAQ</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/privacy">Privacy Policy</NavDropdown.Item>
            </NavDropdown>

            <Nav.Item>
              <NavLink to="/contact" className={getNavLinkClass}>Contact</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/login" className={getNavLinkClass}>Login</NavLink>
            </Nav.Item>
          </Nav>
          
          {/* Appointment Button */}
          <Button 
            variant="primary" 
            className="appointment-btn"
            onClick={handleAppointmentClick}
          >
            <FaPhoneAlt className="me-2" />
            Appointment
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
