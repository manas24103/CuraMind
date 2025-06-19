import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api';
import type { User } from '../types/user';

interface MedicalHistoryItem {
  date: string;
  diagnosis?: string;
  prescriptions?: Array<{
    medicine: string;
    dosage: string;
    duration: number;
  }>;
}

interface Patient extends Omit<User, 'medicalHistory'> {
  _id: string;
  id?: string; // For backward compatibility
  medicalHistory?: MedicalHistoryItem[];
}

const PatientList = () => {
    const { data: response, isLoading, error } = useQuery<{ data: Patient[] }, Error>({
    queryKey: ['patients'],
    queryFn: () => 
      apiService.getPatients()
        .then((res) => res.data as { data: Patient[] })
        .catch((error) => {
          console.error('Error fetching patients:', error);
          throw error;
        })
  });

  const patients: Patient[] = response?.data || [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }


  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error loading patients. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (patients.length === 0) {
    return (
      <Box p={2}>
        <Typography>No patients found.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List>
        {patients.slice(0, 5).map((patient: Patient, index: number) => (
          <ListItem 
            key={patient._id || patient.id || `patient-${index}`}
            button 
            component={Link} 
            to={`/patients/${patient._id}`}
            sx={{
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              mb: 0.5,
            }}
          >
            <ListItemAvatar>
              <Avatar>{(patient.name?.[0] || 'U').toUpperCase()}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography 
                  variant="subtitle1" 
                  component="div"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {patient.name || 'Unknown Patient'}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {patient.email || 'No email available'}
                </Typography>
              }
            />
            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  ml: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '40%',
                }}
              >
                {patient.medicalHistory[0]?.diagnosis || 'No diagnosis'}
              </Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PatientList;
