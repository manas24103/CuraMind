import React, { useState, useEffect } from 'react';
import { getPrescriptionById } from '../services/prescriptionService';
import apiService from '../services/api';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  getPatients, 
  getPatientMedicalHistory, 
  addOrUpdateMedicalRecord, 
  generateAIPrescription,
  type Prescription,
  type MedicalRecord,
  type Patient,
  type MedicalRecordInput
} from '../services/prescriptionService';

interface PrescriptionFormData {
  medicine: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

const initialFormData: PrescriptionFormData = {
  medicine: '',
  dosage: '',
  duration: '7 days',
  instructions: ''
};

interface PrescriptionsPageProps {
  mode?: 'view' | 'new';
}

const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({ mode = 'view' }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [recordDate, setRecordDate] = useState<Date | null>(new Date());
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [patientMedicalHistory, setPatientMedicalHistory] = useState<string>('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [formData, setFormData] = useState<PrescriptionFormData>(initialFormData);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  
  const isViewMode = mode === 'view';
  const isNewMode = mode === 'new';

  // Load patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        
        // First try using the prescription service
        try {
          const data = await getPatients();
          if (Array.isArray(data)) {
            setPatients(data);
            return;
          }
        } catch (serviceErr) {
          console.warn('Failed to load patients via prescription service, falling back to API', serviceErr);
        }
        
        // Fallback to direct API call if service fails
        try {
          const response = await apiService.getPatients();
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            setPatients(response.data.data);
          } else {
            console.error('Unexpected response format:', response);
            setError('Failed to load patients: Invalid response format');
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          throw new Error('Failed to load patients. Please check your connection and try again.');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // If in view or new mode, handle accordingly
  useEffect(() => {
    const fetchPrescription = async () => {
      if (isViewMode) {
        const id = window.location.pathname.split('/').pop();
        if (id) {
          try {
            setIsLoading(true);
            // Use the prescription service to fetch the prescription by ID
            const response = await getPrescriptionById(id);
            const prescription = response.data;
            
            if (prescription) {
              // Handle patientId which could be string or object
              const patientId = typeof prescription.patientId === 'string' 
                ? prescription.patientId 
                : prescription.patientId._id;
              setSelectedPatient(patientId);
              
              // Set the form data from the prescription
              if (prescription.doctorFinalPrescription) {
                setFormData({
                  medicine: '', // These fields should be parsed from the prescription text
                  dosage: '',
                  duration: '7 days',
                  instructions: prescription.doctorFinalPrescription
                });
              } else {
                setFormData(initialFormData);
              }
            }
          } catch (error) {
            console.error('Error fetching prescription:', error);
            setError('Failed to load prescription. Please try again.');
          } finally {
            setIsLoading(false);
          }
        }
      } else if (isNewMode) {
        // Initialize form for new prescription
        setSelectedPatient('');
        setRecordDate(new Date());
        setFormData(initialFormData);
        setPrescriptions([]);
        setIsLoading(false);
      }
    };

    fetchPrescription();
  }, [isViewMode, isNewMode]);

  const handleAddPrescription = () => {
    if (formData.medicine && formData.dosage) {
      const newPrescription: Prescription = {
        ...formData
      };
      setPrescriptions([...prescriptions, newPrescription]);
      setFormData(initialFormData);
    }
  };

  const handleRemovePrescription = (index: number) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions.splice(index, 1);
    setPrescriptions(updatedPrescriptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !recordDate || prescriptions.length === 0) {
      setError('Please fill in all required fields and add at least one prescription');
      return;
    }

    setIsLoading(true);
    try {
      const medicalRecord: MedicalRecordInput = {
        date: recordDate.toISOString(),
        diagnosis,
        prescriptions: prescriptions.map(p => ({
          medicine: p.medicine,
          dosage: p.dosage,
          duration: p.duration,
          instructions: p.instructions || ''
        }))
      };
      
      await addOrUpdateMedicalRecord(selectedPatient, medicalRecord);
      
      setSuccess('Prescription added successfully');
      setPrescriptions([]);
      setDiagnosis('');
      // Refresh medical records
      await loadMedicalRecords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prescription';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAIPrescription = async () => {
    if (!symptoms) {
      setError('Please describe the symptoms');
      return;
    }

    setIsAiGenerating(true);
    try {
      const aiPrescription = await generateAIPrescription({
        patientId: selectedPatient,
        symptoms,
        medicalHistory: patientMedicalHistory
      });
      
      // Extract the AI prescription text from the response
      const newPrescription: Prescription = {
        medicine: aiPrescription.data.aiPrescription,
        dosage: 'As directed',
        duration: '7 days',
        instructions: 'Please review and adjust the AI-generated prescription as needed.'
      };
      
      setPrescriptions([...prescriptions, newPrescription]);
      setSuccess('AI prescription generated');
      setIsAiDialogOpen(false);
      setSymptoms('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI prescription';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const loadMedicalRecords = async () => {
    if (!selectedPatient) return;
    
    setIsLoading(true);
    try {
      const records = await getPatientMedicalHistory(selectedPatient);
      // Sort records by date, newest first
      const sortedRecords = [...records].sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });
      setMedicalRecords(sortedRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load medical records';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      loadMedicalRecords();
    }
  }, [selectedPatient]);

  // Loading overlay
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Prescription Management
        </Typography>

        {/* Error and Success Alerts */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
        
        {/* Patient Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="patient-select-label">Select Patient</InputLabel>
          <Select
            labelId="patient-select-label"
            value={selectedPatient}
            label="Select Patient"
            onChange={(e) => setSelectedPatient(e.target.value as string)}
            disabled={isLoading}
          >
            {patients.map((patient) => (
              <MenuItem key={patient._id} value={patient._id}>
                {patient.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedPatient && (
          <>
            {/* Medical Record Form */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                New Medical Record
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Box display="flex" gap={2} mb={3}>
                  <DatePicker
                    label="Record Date"
                    value={recordDate}
                    onChange={(newValue) => setRecordDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      }
                    }}
                    disabled={isLoading}
                  />
                  
                  <TextField
                    fullWidth
                    label="Diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Box>
                
                {/* Prescription Form */}
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Prescriptions
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2} mb={2}>
                    <Box display="flex" gap={2}>
                      <TextField
                        label="Medicine"
                        value={formData.medicine}
                        onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                        fullWidth
                        required
                        disabled={isLoading}
                      />
                      <TextField
                        label="Dosage"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        fullWidth
                        required
                        disabled={isLoading}
                        helperText="e.g., 500mg, 1 tablet"
                      />
                      <TextField
                        label="Duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        sx={{ width: '200px' }}
                        required
                        disabled={isLoading}
                        helperText="e.g., 7 days, 2 weeks"
                      />
                    </Box>
                    <Box display="flex" gap={2} alignItems="flex-end">
                      <TextField
                        label="Instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        fullWidth
                        disabled={isLoading}
                        helperText="Special instructions for taking the medicine"
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddPrescription}
                        startIcon={<AddIcon />}
                        disabled={!formData.medicine || !formData.dosage || isLoading}
                        sx={{ height: '56px' }}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setIsAiDialogOpen(true)}
                        disabled={!selectedPatient || isLoading}
                        sx={{ height: '56px' }}
                      >
                        AI Suggest
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Prescriptions List */}
                  {prescriptions.length > 0 && (
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Instructions</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {prescriptions.map((prescription, index) => (
                            <TableRow key={index}>
                              <TableCell>{prescription.medicine}</TableCell>
                              <TableCell>{prescription.dosage}</TableCell>
                              <TableCell>{prescription.duration}</TableCell>
                              <TableCell>{prescription.instructions || '-'}</TableCell>
                              <TableCell>
                                <IconButton 
                                  onClick={() => handleRemovePrescription(index)}
                                  color="error"
                                  size="small"
                                  disabled={isLoading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
                
                {/* Submit Button */}
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading || prescriptions.length === 0}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    {isLoading ? 'Saving...' : 'Save Medical Record'}
                  </Button>
                </Box>
              </Box>
            </Paper>
            
            {/* Medical Records History */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Medical Records History
              </Typography>
              
              {medicalRecords.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No medical records found for this patient.
                  </Typography>
                </Paper>
              ) : (
                medicalRecords.map((record, index) => (
                  <Paper key={index} sx={{ p: 3, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle1">
                        {record.date ? new Date(record.date).toLocaleDateString() : 'No date'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {record.diagnosis || 'No diagnosis provided'}
                      </Typography>
                    </Box>
                    
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Medicine</TableCell>
                              <TableCell>Dosage</TableCell>
                              <TableCell>Duration</TableCell>
                              <TableCell>Instructions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {record.prescriptions.map((rx, rxIndex) => (
                              <TableRow key={rxIndex}>
                                <TableCell>{rx.medicine}</TableCell>
                                <TableCell>{rx.dosage}</TableCell>
                                <TableCell>{rx.duration}</TableCell>
                                <TableCell>{rx.instructions || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          </>
        )}
        
        {/* AI Prescription Dialog */}
        <Dialog 
          open={isAiDialogOpen} 
          onClose={() => !isAiGenerating && setIsAiDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>AI-Powered Prescription Assistant</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Patient Symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                multiline
                rows={3}
                margin="normal"
                required
                disabled={isAiGenerating}
                helperText="Describe the patient's symptoms in detail"
              />
              <TextField
                fullWidth
                label="Medical History (Optional)"
                value={patientMedicalHistory}
                onChange={(e) => setPatientMedicalHistory(e.target.value)}
                multiline
                rows={3}
                margin="normal"
                disabled={isAiGenerating}
                helperText="Any relevant medical history or known conditions"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsAiDialogOpen(false)}
              disabled={isAiGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateAIPrescription}
              variant="contained"
              disabled={!symptoms || isAiGenerating}
              startIcon={isAiGenerating ? <CircularProgress size={20} /> : null}
            >
              {isAiGenerating ? 'Generating...' : 'Generate Prescription'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default PrescriptionsPage;