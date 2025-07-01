import React from 'react';
import { format } from 'date-fns';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface Prescription {
  id: string;
  patientName: string;
  date: string;
  medication: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

const RecentPrescriptions: React.FC = () => {
  // Sample data - replace with actual data from your API
  const recentPrescriptions: Prescription[] = [
    {
      id: 'RX001',
      patientName: 'John Doe',
      date: '2023-06-15',
      medication: 'Ibuprofen 400mg',
      status: 'Active'
    },
    {
      id: 'RX002',
      patientName: 'Jane Smith',
      date: '2023-06-14',
      medication: 'Amoxicillin 500mg',
      status: 'Active'
    },
  ];

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Recent Prescriptions
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Medication</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentPrescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>{prescription.id}</TableCell>
                <TableCell>{prescription.patientName}</TableCell>
                <TableCell>
                  {format(new Date(prescription.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{prescription.medication}</TableCell>
                <TableCell>
                  <Box 
                    component="span"
                    sx={{
                      color: prescription.status === 'Active' ? 'success.main' : 
                            prescription.status === 'Completed' ? 'text.secondary' : 'error.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {prescription.status}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentPrescriptions;
