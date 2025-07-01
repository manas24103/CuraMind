import { useMutation, useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import type { Appointment } from '../types/appointment';
import type { User } from '../types/user';

type QueryClientType = QueryClient;

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
  patient: Patient | string;
  doctor: User | string;
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type AppointmentsResponse = ApiResponse<PopulatedAppointment[]>;

export const useAppointments = () => {
  const queryClient = useQueryClient();

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useQuery<AppointmentsResponse, Error, PopulatedAppointment[]>({
    queryKey: ['appointments'],
    queryFn: () => apiService.getAppointments().then((res) => ({
      success: true,
      data: res.data as unknown as PopulatedAppointment[]
    })),
    select: (data) => data.data,
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: Appointment['status'] 
    }) => {
      try {
        return await apiService.updateAppointment(id, { status });
      } catch (error) {
        console.error('Failed to update appointment:', error);
        throw error; // Re-throw to trigger onError
      }
    },
    
    // Optimistic update
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['appointments'] });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData<PopulatedAppointment[]>(['appointments']);

      // Optimistically update to the new value
      if (previousAppointments) {
        queryClient.setQueryData<PopulatedAppointment[]>(['appointments'], (old) =>
          old?.map((appt) =>
            appt._id === variables.id ? { ...appt, status: variables.status } : appt
          )
        );
      }

      // Return a context with the previous appointments
      return { previousAppointments };
    },
    
    // On success, just invalidate the query to refetch
    onSuccess: () => {
      // The query will be refetched automatically due to invalidation
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, variables, context) => {
      console.error('Failed to update appointment:', error);
      // Rollback to the previous state
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
      // Consider showing a toast notification here
    },
    
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (appointmentData: any) => {
      return await apiService.post('/appointments', appointmentData);
    },
    onSuccess: () => {
      // Invalidate and refetch appointments after successful creation
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Failed to create appointment:', error);
    }
  });

  return {
    appointments,
    isLoading,
    isError,
    error,
    updateAppointmentStatus,
    createAppointment,
  };
};
