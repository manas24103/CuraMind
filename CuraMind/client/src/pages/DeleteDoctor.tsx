import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import apiService, { ApiResponse } from '../services/api.service';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  experience?: number;
  qualification?: string;
  bio?: string;
}

const DeleteDoctor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Fetch doctor details
  const { data, isLoading, error } = useQuery<ApiResponse<Doctor>, Error>(
    ['doctor', id],
    () => id ? apiService.get<Doctor>(`/doctors/${id}`) : Promise.reject('No ID provided'),
    { enabled: !!id }
  );
  
  const doctor = data?.data;

  // Delete mutation
  const deleteMutation = useMutation(
    () => {
      if (!id) return Promise.reject('No ID provided');
      return apiService.delete(`/doctors/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('doctors');
        navigate('/doctors');
      },
      onError: (error: any) => {
        console.error('Error deleting doctor:', error);
      }
    }
  );

  const handleDelete = () => {
    setOpen(false);
    deleteMutation.mutate();
  };

  const handleCancel = () => {
    setOpen(false);
    navigate('/doctors');
  };

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
        Error loading doctor details: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  if (!doctor) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Doctor not found
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Delete Doctor</Typography>
      
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Are you sure you want to delete this doctor?
        </Typography>
        
        <Box sx={{ my: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography><strong>Name:</strong> {doctor.name}</Typography>
          <Typography><strong>Specialization:</strong> {doctor.specialization || 'N/A'}</Typography>
          <Typography><strong>Email:</strong> {doctor.email}</Typography>
        </Box>
        
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button 
            variant="outlined" 
            onClick={handleCancel}
            disabled={deleteMutation.isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => setOpen(true)}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete Doctor'}
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {doctor.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteDoctor;
