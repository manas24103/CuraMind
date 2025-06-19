import React from 'react';
import { Typography, Box, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useQuery } from 'react-query';
import apiService from '../services/api.service';
import { Link } from 'react-router-dom';
import { PersonAdd } from '@mui/icons-material';

const AllDoctors = () => {
  const { data: doctors, isLoading, error } = useQuery('doctors', () => 
    apiService.get('/doctors').then(res => res.data)
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading doctors: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">All Doctors</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PersonAdd />}
          component={Link}
          to="/add-doctor"
        >
          Add Doctor
        </Button>
      </Box>
      
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors?.map((doctor: any) => (
                <TableRow key={doctor._id} hover>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.phone}</TableCell>
                  <TableCell align="right">
                    <Button 
                      component={Link} 
                      to={`/doctor-profile/${doctor._id}`}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/delete-doctor/${doctor._id}`}
                      color="error"
                      size="small"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AllDoctors;
