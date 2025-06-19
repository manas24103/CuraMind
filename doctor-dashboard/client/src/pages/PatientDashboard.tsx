import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { Construction } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const PatientDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box 
        minHeight="80vh" 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center"
        textAlign="center"
        px={2}
      >
        <Construction 
          fontSize="large" 
          color="disabled" 
          sx={{ fontSize: 80, mb: 3, opacity: 0.7 }} 
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Patient Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome to your patient dashboard. This page is currently under construction.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
          We're working hard to bring you a better experience. In the meantime, you can check your appointments or return to the home page.
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/appointments"
            size="large"
          >
            View Appointments
          </Button>
          <Button 
            variant="outlined" 
            component={RouterLink} 
            to="/"
            size="large"
          >
            Return Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PatientDashboard;
