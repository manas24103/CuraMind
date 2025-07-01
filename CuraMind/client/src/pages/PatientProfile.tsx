import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, Divider, Tabs, Tab } from '@mui/material';
import Stack from '@mui/material/Stack';

// Define the Patient interface
interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  address: string;
  lastVisit: string;
  medicalHistory: Array<{
    date: string;
    diagnosis: string;
    treatment: string;
  }>;
}

// Mock data - replace with API call
const mockPatient: Patient = {
  id: 1,
  name: 'John Doe',
  age: 35,
  gender: 'Male',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Anytown, USA',
  lastVisit: '2023-06-15',
  medicalHistory: [
    { date: '2023-06-15', diagnosis: 'Annual Checkup', treatment: 'Routine examination' },
    { date: '2023-03-10', diagnosis: 'Flu', treatment: 'Prescribed medication' },
  ],
};

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  // In a real app, you would fetch the patient data here using the id
  const patient = mockPatient;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {patient.name}'s Profile
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/patients/${id}/prescriptions`)}
          >
            View Prescriptions
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Back to Patients
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Name:</strong> {patient.name}</Typography>
            <Typography><strong>Age:</strong> {patient.age}</Typography>
            <Typography><strong>Gender:</strong> {patient.gender}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Email:</strong> {patient.email}</Typography>
            <Typography><strong>Phone:</strong> {patient.phone}</Typography>
            <Typography><strong>Address:</strong> {patient.address}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Medical Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Last Visit:</strong> {patient.lastVisit}</Typography>
            <Typography><strong>Status:</strong> Active</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Medical History" />
        <Tab label="Appointments" />
        <Tab label="Prescriptions" />
      </Tabs>

      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Medical History</Typography>
            </Box>
            {patient.medicalHistory.map((record, index) => (
              <Card key={index} sx={{ mb: 2, borderLeft: '4px solid #1976d2' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">{record.diagnosis}</Typography>
                    <Typography variant="body2" color="text.secondary">{record.date}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>{record.treatment}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Appointments</Typography>
            <Typography color="text.secondary">No upcoming appointments</Typography>
          </Box>
        )}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Prescriptions</Typography>
            <Typography color="text.secondary">No active prescriptions</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PatientProfile;
