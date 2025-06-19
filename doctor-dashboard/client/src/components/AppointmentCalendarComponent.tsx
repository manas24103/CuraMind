import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import apiService from '../services/api.service';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Button, 
  Grid, 
  Chip, 
  Card, 
  CardContent, 
  CardActions, 
  Avatar,
  TextField,
  useMediaQuery,
  Theme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { format } from 'date-fns';
import { useAppointments } from '../hooks/useAppointments';
import { 
  getStatusColor, 
  getPatientName, 
  getFilteredAppointments,
  getAppointmentStatus
} from '../utils/appointmentHelpers';
import type { Appointment } from '../types/appointment';
import type { User } from '../types/user';

type Patient = User & {
  medicalHistory?: Array<{
    date: Date;
    diagnosis?: string;
    prescriptions?: Array<{
      medicine: string;
      dosage: string;
      duration: number;
    }>;
  }>;
};

type PopulatedAppointment = Omit<Appointment, 'patient' | 'doctor'> & {
  _id: string;
  patient: Patient | string;
  doctor: User | string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  notes?: string;
  type?: string;
};

// Type for the status update function
type UpdateStatusFunction = (id: string, status: Appointment['status']) => void;

interface AppointmentFormData {
  patientName: string;
  date: string;
  time: string;
  type: string;
  notes: string;
}

interface AppointmentCalendarProps {
  mode?: 'view' | 'create';
}

const AppointmentCalendarComponent: React.FC<AppointmentCalendarProps> = ({ mode = 'view' }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formErrors, setFormErrors] = useState<Partial<AppointmentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'checkup',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<AppointmentFormData> = {};
    
    if (!formData.patientName.trim()) {
      errors.patientName = 'Patient name is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    } else if (new Date(formData.date) < new Date(new Date().setHours(0, 0, 0, 0))) {
      errors.date = 'Date cannot be in the past';
    }
    
    if (!formData.time) {
      errors.time = 'Time is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      type: 'checkup',
      notes: ''
    });
    setFormErrors({});
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Please fix the form errors', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        patientName: formData.patientName,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        notes: formData.notes,
        status: 'scheduled' as const
      };
      
      // Call the API to create the appointment
      const response = await apiService.appointments.create(appointmentData);
      
      if (response.success) {
        enqueueSnackbar('Appointment created successfully!', { variant: 'success' });
        resetForm();
        navigate('/appointments');
      } else {
        throw new Error(response.message || 'Failed to create appointment');
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      enqueueSnackbar(error.message || 'Failed to create appointment', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { 
    appointments, 
    isLoading, 
    isError, 
    updateAppointmentStatus,
    createAppointment
  } = useAppointments();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleStatusUpdate: UpdateStatusFunction = (appointmentId, newStatus) => {
    updateAppointmentStatus.mutate({ id: appointmentId, status: newStatus });
  };

  const renderStatusButton = (
    appointmentId: string, 
    status: Appointment['status'], 
    label: string, 
    color: 'success' | 'error' | 'primary'
  ) => (
    <Button
      size="small"
      color={color}
      onClick={() => handleStatusUpdate(appointmentId, status)}
      disabled={updateAppointmentStatus.isPending}
      startIcon={updateAppointmentStatus.isPending ? <CircularProgress size={16} /> : undefined}
    >
      {label}
    </Button>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading appointments. Please try again later.</Typography>
      </Box>
    );
  }

  // Effect to show error if there are any form errors
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      enqueueSnackbar('Please fix the form errors', { variant: 'error' });
    }
  }, [formErrors, enqueueSnackbar]);

  if (mode === 'create') {
    return (
      <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>Schedule New Appointment</Typography>
        <form onSubmit={handleCreateAppointment}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                error={!!formErrors.patientName}
                helperText={formErrors.patientName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!formErrors.date}
                helperText={formErrors.date}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 900, // 15 min
                }}
                error={!!formErrors.time}
                helperText={formErrors.time}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="appointment-type-label">Appointment Type</InputLabel>
                <Select
                  labelId="appointment-type-label"
                  name="type"
                  value={formData.type}
                  label="Appointment Type"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="checkup">Checkup</MenuItem>
                  <MenuItem value="followup">Follow-up</MenuItem>
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => window.history.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    );
  }

  const todayAppointments = getFilteredAppointments(appointments as PopulatedAppointment[], selectedDate);

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Appointments
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/appointments/new')}
          sx={{ ml: 2 }}
        >
          New Appointment
        </Button>
        <Box>
          {showDatePicker ? (
            <TextField
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              onBlur={() => setShowDatePicker(false)}
              autoFocus
            />
          ) : (
            <Button 
              variant="outlined" 
              onClick={() => setShowDatePicker(true)}
            >
              {format(selectedDate, 'MMMM d, yyyy')}
            </Button>
          )}
        </Box>
      </Box>

      {todayAppointments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No appointments scheduled for {format(selectedDate, 'MMMM d, yyyy')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {[...todayAppointments]
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((appointment) => {
              const { isPastAppointment, isUpcoming, isCurrentDateSelected } = getAppointmentStatus(appointment, selectedDate);
              const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

              return (
                <Grid item xs={12} sm={6} md={4} key={appointment._id}>
                  <Card 
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: `4px solid ${
                        isPastAppointment 
                          ? '#9e9e9e' 
                          : isUpcoming 
                            ? '#1976d2' 
                            : '#4caf50'
                      }`
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                          {getPatientName(appointment.patient).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" component="div">
                            {getPatientName(appointment.patient)}
                          </Typography>
                          <Box display={isMobile ? 'block' : 'flex'} gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              {format(appointmentDateTime, 'h:mm a')}
                            </Typography>
                            {appointment.type && (
                              <Chip 
                                label={appointment.type} 
                                size="small" 
                                variant="outlined"
                                sx={{ ml: isMobile ? 0 : 1 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box mt={2}>
                        <Chip 
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {appointment.notes && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            mt={1}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {appointment.notes}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ 
                      justifyContent: 'flex-end', 
                      p: 2,
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      {appointment.status === 'pending' && isCurrentDateSelected && (
                        <>
                          {renderStatusButton(appointment._id, 'confirmed', 'Confirm', 'success')}
                          {renderStatusButton(appointment._id, 'cancelled', 'Cancel', 'error')}
                        </>
                      )}
                      {appointment.status === 'confirmed' && isCurrentDateSelected && (
                        <>
                          {renderStatusButton(appointment._id, 'completed', 'Complete', 'primary')}
                          {renderStatusButton(appointment._id, 'cancelled', 'Cancel', 'error')}
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
    </Box>
  );
};

export default AppointmentCalendarComponent;
