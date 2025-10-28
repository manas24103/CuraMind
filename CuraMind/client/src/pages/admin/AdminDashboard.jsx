import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { adminAPI, doctorAPI, patientAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    receptionists: 0
  });
  const [doctors, setDoctors] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showReceptionistModal, setShowReceptionistModal] = useState(false);
  const [isLoading, setIsLoading] = useState({
    stats: true,
    doctors: true,
    receptionists: true
  });
  const [error, setError] = useState('');
  
  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    phone: ''
  });
  
  const [receptionistForm, setReceptionistForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [patientsRes, doctorsRes, receptionistsRes] = await Promise.all([
          patientAPI.getPatients(),
          adminAPI.getDoctors(),
          adminAPI.getReceptionists()
        ]);

        setStats({
          patients: patientsRes.data.length,
          doctors: doctorsRes.data.length,
          receptionists: receptionistsRes.data.length
        });

        setDoctors(doctorsRes.data);
        setReceptionists(receptionistsRes.data);
        
        setIsLoading({ stats: false, doctors: false, receptionists: false });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
        setIsLoading({ stats: false, doctors: false, receptionists: false });
      }
    };

    fetchDashboardData();
  }, []);

  // Handle form changes
  const handleDoctorFormChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceptionistFormChange = (e) => {
    const { name, value } = e.target;
    setReceptionistForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submissions
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createDoctor(doctorForm);
      toast.success('Doctor created successfully');
      setShowDoctorModal(false);
      // Refresh data
      const [doctorsRes, statsRes] = await Promise.all([
        adminAPI.getDoctors(),
        adminAPI.getDashboardStats()
      ]);
      setDoctors(doctorsRes.data);
      setStats(prev => ({ ...prev, doctors: statsRes.data.doctors }));
      // Reset form
      setDoctorForm({
        name: '',
        email: '',
        password: '',
        specialization: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error creating doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleCreateReceptionist = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createReceptionist(receptionistForm);
      toast.success('Receptionist created successfully');
      setShowReceptionistModal(false);
      // Refresh data
      const [receptionistsRes, statsRes] = await Promise.all([
        adminAPI.getReceptionists(),
        adminAPI.getDashboardStats()
      ]);
      setReceptionists(receptionistsRes.data);
      setStats(prev => ({ ...prev, receptionists: statsRes.data.receptionists }));
      // Reset form
      setReceptionistForm({
        name: '',
        email: '',
        password: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error creating receptionist:', error);
      toast.error(error.response?.data?.message || 'Failed to create receptionist');
    }
  };

  // Handle deletions
  const handleDeleteDoctor = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await adminAPI.deleteDoctor(id);
        setDoctors(prev => prev.filter(doctor => doctor._id !== id));
        setStats(prev => ({
          ...prev,
          doctors: prev.doctors - 1
        }));
        toast.success('Doctor deleted successfully');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        toast.error('Failed to delete doctor');
      }
    }
  };

  const handleDeleteReceptionist = async (id) => {
    if (window.confirm('Are you sure you want to delete this receptionist?')) {
      try {
        await adminAPI.deleteReceptionist(id);
        setReceptionists(prev => prev.filter(rec => rec._id !== id));
        setStats(prev => ({
          ...prev,
          receptionists: prev.receptionists - 1
        }));
        toast.success('Receptionist deleted successfully');
      } catch (error) {
        console.error('Error deleting receptionist:', error);
        toast.error('Failed to delete receptionist');
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Patients</Card.Title>
              <Card.Text className="display-4">
                {isLoading.stats ? <Spinner animation="border" size="sm" /> : stats.patients}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Doctors</Card.Title>
              <Card.Text className="display-4">
                {isLoading.stats ? <Spinner animation="border" size="sm" /> : stats.doctors}
              </Card.Text>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowDoctorModal(true)}
              >
                Add New Doctor
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Receptionists</Card.Title>
              <Card.Text className="display-4">
                {isLoading.stats ? <Spinner animation="border" size="sm" /> : stats.receptionists}
              </Card.Text>
              <Button 
                variant="success" 
                size="sm"
                onClick={() => setShowReceptionistModal(true)}
              >
                Add New Receptionist
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Doctors Table */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>Doctors List</h5>
            </Card.Header>
            <Card.Body>
              {isLoading.doctors ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doctor => (
                      <tr key={doctor._id}>
                        <td>{doctor.name}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.specialization}</td>
                        <td>{doctor.phone}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteDoctor(doctor._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Receptionists Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Receptionists List</h5>
            </Card.Header>
            <Card.Body>
              {isLoading.receptionists ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receptionists.map(receptionist => (
                      <tr key={receptionist._id}>
                        <td>{receptionist.name}</td>
                        <td>{receptionist.email}</td>
                        <td>{receptionist.phone}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteReceptionist(receptionist._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Doctor Modal */}
      <Modal show={showDoctorModal} onHide={() => setShowDoctorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Doctor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateDoctor}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={doctorForm.name}
                onChange={handleDoctorFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={doctorForm.email}
                onChange={handleDoctorFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={doctorForm.password}
                onChange={handleDoctorFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Specialization</Form.Label>
              <Form.Control
                type="text"
                name="specialization"
                value={doctorForm.specialization}
                onChange={handleDoctorFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={doctorForm.phone}
                onChange={handleDoctorFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDoctorModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Create Doctor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Receptionist Modal */}
      <Modal show={showReceptionistModal} onHide={() => setShowReceptionistModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Receptionist</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateReceptionist}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={receptionistForm.name}
                onChange={handleReceptionistFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={receptionistForm.email}
                onChange={handleReceptionistFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={receptionistForm.password}
                onChange={handleReceptionistFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={receptionistForm.phone}
                onChange={handleReceptionistFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReceptionistModal(false)}>
              Close
            </Button>
            <Button variant="success" type="submit">
              Create Receptionist
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
