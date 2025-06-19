import React from 'react';
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
  Theme
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

const AppointmentCalendarComponent = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const { 
    appointments, 
    isLoading, 
    isError, 
    updateAppointmentStatus 
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

  const todayAppointments = getFilteredAppointments(appointments as PopulatedAppointment[], selectedDate);

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Appointments
        </Typography>
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
