import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { patientAPI, appointmentAPI, doctorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ReceptionistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState({
    patients: true,
    doctors: true,
    appointments: true
  });
  const [activeTab, setActiveTab] = useState('patients');

  // Form states
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    date: new Date(),
    time: '',
    reason: '',
    status: 'scheduled'
  });

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          patientAPI.getPatients(),
          doctorAPI.getDoctors(),
          appointmentAPI.getAppointments()
        ]);

        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setAppointments(appointmentsRes.data);
        
        setIsLoading({ patients: false, doctors: false, appointments: false });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setIsLoading({ patients: false, doctors: false, appointments: false });
      }
    };

    fetchData();
  }, []);

  // Handle form changes
  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppointmentFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change for appointment
  const handleDateChange = (date) => {
    setAppointmentForm(prev => ({
      ...prev,
      date: date
    }));
  };

  // Create new patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const response = await patientAPI.createPatient(patientForm);
      setPatients(prev => [...prev, response.data]);
      setShowPatientModal(false);
      toast.success('Patient created successfully');
      
      // Reset form
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'male'
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error(error.response?.data?.message || 'Failed to create patient');
    }
  };

  // Book appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      // Format date and time
      const appointmentDate = new Date(appointmentForm.date);
      const [hours, minutes] = appointmentForm.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));
      
      const appointmentData = {
        ...appointmentForm,
        dateTime: appointmentDate.toISOString()
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      setAppointments(prev => [...prev, response.data]);
      setShowAppointmentModal(false);
      toast.success('Appointment booked successfully');
      
      // Reset form
      setAppointmentForm({
        patientId: '',
        doctorId: '',
        date: new Date(),
        time: '',
        reason: '',
        status: 'scheduled'
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Receptionist Dashboard</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="patients" title="Patients">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Patients List</h5>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowPatientModal(true)}
              >
                Add New Patient
              </Button>
            </Card.Header>
            <Card.Body>
              {isLoading.patients ? (
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
                      <th>Date of Birth</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient._id}>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.phone}</td>
                        <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                        <td>{patient.gender}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setAppointmentForm(prev => ({
                                ...prev,
                                patientId: patient._id
                              }));
                              setShowAppointmentModal(true);
                            }}
                          >
                            Book Appointment
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="appointments" title="Appointments">
          <Card>
            <Card.Header>
              <h5>Upcoming Appointments</h5>
            </Card.Header>
            <Card.Body>
              {isLoading.appointments ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appointment => {
                      const patient = patients.find(p => p._id === appointment.patientId);
                      const doctor = doctors.find(d => d._id === appointment.doctorId);
                      
                      return (
                        <tr key={appointment._id}>
                          <td>{patient?.name || 'N/A'}</td>
                          <td>Dr. {doctor?.name || 'N/A'}</td>
                          <td>{formatDate(appointment.dateTime)}</td>
                          <td>{appointment.reason}</td>
                          <td>
                            <span className={`badge ${
                              appointment.status === 'completed' ? 'bg-success' :
                              appointment.status === 'cancelled' ? 'bg-danger' :
                              'bg-primary'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Add Patient Modal */}
      <Modal show={showPatientModal} onHide={() => setShowPatientModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Patient</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreatePatient}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={patientForm.name}
                    onChange={handlePatientFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handlePatientFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={patientForm.dateOfBirth}
                    onChange={handlePatientFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientFormChange}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={patientForm.address}
                    onChange={handlePatientFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPatientModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Patient
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Book Appointment Modal */}
      <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookAppointment}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Control
                as="select"
                name="patientId"
                value={appointmentForm.patientId}
                onChange={handleAppointmentFormChange}
                required
                disabled={!!selectedPatient}
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} ({patient.phone})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Control
                as="select"
                name="doctorId"
                value={appointmentForm.doctorId}
                onChange={handleAppointmentFormChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={appointmentForm.date}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="form-control"
                    dateFormat="MMMM d, yyyy"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Select
                    name="time"
                    value={appointmentForm.time}
                    onChange={handleAppointmentFormChange}
                    required
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Reason for Visit</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={appointmentForm.reason}
                onChange={handleAppointmentFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={appointmentForm.status}
                onChange={handleAppointmentFormChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAppointmentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Book Appointment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ReceptionistDashboard;
