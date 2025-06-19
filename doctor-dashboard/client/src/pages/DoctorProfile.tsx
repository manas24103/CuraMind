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
  Grid,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
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

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch doctor details
  const { data, isLoading, error } = useQuery<ApiResponse<Doctor>, Error>(
    ['doctor', id],
    () => apiService.get<Doctor>(`/doctors/${id}`),
    { enabled: !!id }
  );
  
  const doctor = data?.data;

  // Delete mutation
  const deleteMutation = useMutation(
    () => apiService.delete(`/doctors/${id}`),
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
    setDeleteDialogOpen(false);
    deleteMutation.mutate();
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/edit-doctor/${id}`);
    }
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
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Doctor Profile
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={doctor.avatar}
              sx={{ 
                width: 180, 
                height: 180, 
                mx: 'auto',
                mb: 2,
                fontSize: 60,
                bgcolor: 'primary.main'
              }}
            >
              {doctor.name?.charAt(0) || 'D'}
            </Avatar>
            
            <Box mt={2}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{ mr: 1, mb: { xs: 2, md: 0 } }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>{doctor.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {doctor.specialization}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">Contact Information</Typography>
              <Box mt={1.5}>
                <Typography><strong>Email:</strong> {doctor.email}</Typography>
                <Typography><strong>Phone:</strong> {doctor.phone || 'N/A'}</Typography>
              </Box>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">Professional Information</Typography>
              <Box mt={1.5}>
                <Typography><strong>Department:</strong> {doctor.department || 'N/A'}</Typography>
                <Typography><strong>Experience:</strong> {doctor.experience ? `${doctor.experience} years` : 'N/A'}</Typography>
                <Typography><strong>Qualification:</strong> {doctor.qualification || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {doctor.bio && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">About</Typography>
                <Typography variant="body1" mt={1}>{doctor.bio}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete Dr. {doctor.name}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus disabled={deleteMutation.isLoading}>
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorProfile;
