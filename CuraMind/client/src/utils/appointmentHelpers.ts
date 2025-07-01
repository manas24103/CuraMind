import { format, isToday, isFuture, isPast } from 'date-fns';
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

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'completed':
      return 'primary';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const isPopulatedPatient = (patient: Patient | string): patient is Patient => {
  return typeof patient !== 'string' && patient !== null && typeof patient === 'object';
};

export const getPatientName = (patient: Patient | string | undefined): string => {
  if (!patient) return 'Unknown Patient';
  if (!isPopulatedPatient(patient)) return 'Loading...';
  return patient.name || 'Unknown Patient';
};

type PopulatedAppointment = Appointment & {
  _id: string;
  patient: unknown;
  doctor: unknown;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  notes?: string;
  type?: string;
};

export const getFilteredAppointments = (appointments: PopulatedAppointment[], date: Date): PopulatedAppointment[] => {
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    );
  });
};

export const getAppointmentStatus = (appointment: PopulatedAppointment, currentDate: Date) => {
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
  const isPastAppointment = isPast(appointmentDateTime);
  const isUpcoming = isFuture(appointmentDateTime) && !isPastAppointment;
  const isCurrentDateSelected = isToday(currentDate);
  
  return { isPastAppointment, isUpcoming, isCurrentDateSelected };
};
