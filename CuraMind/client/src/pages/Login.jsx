import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Alert, Card, Container, Row, Col } from "react-bootstrap";
import { toast } from 'react-toastify';
import api from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ 
    email: "", 
    password: "",
    userType: "doctor" // Default to doctor
  });
  
  // Map of user types to their display names and dashboard paths
  const userTypes = [
    { value: 'doctor', label: 'Doctor', dashboard: 'doctor-dashboard' },
    { value: 'admin', label: 'Administrator', dashboard: 'admin-dashboard' },
    { value: 'receptionist', label: 'Receptionist', dashboard: 'receptionist-dashboard' }
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token && userType) {
      // Find the user type config
      const userConfig = userTypes.find(type => type.value === userType);
      if (userConfig) {
        navigate(`/${userConfig.dashboard}`);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
        userType: form.userType
      });
      
      const { token, user } = response.data;
      const userType = form.userType;
      const userConfig = userTypes.find(type => type.value === userType);
      
      if (!userConfig) {
        throw new Error('Invalid user type configuration');
      }
      
      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', userType);
      
      // Redirect to appropriate dashboard
      navigate(`/${userConfig.dashboard}`);
      
      // Show welcome message
      const userName = user.name || user.email.split('@')[0];
      const greeting = userType === 'doctor' ? 'Dr. ' : '';
      toast.success(`Welcome back, ${greeting}${userName}`);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={8} lg={6} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">MediTrust Portal</h2>
                <p className="text-muted">Sign in to access your account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>I am a</Form.Label>
                  <Form.Select 
                    name="userType"
                    value={form.userType}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mb-3"
                  >
                    {userTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label>Password</Form.Label>
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Forgot password?
                    </Link>
                  </div>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="text-center mt-3">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/contact" className="text-decoration-none">
                      Contact administrator
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-3">
            <Link to="/" className="text-decoration-none">
              ← Back to Home
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
