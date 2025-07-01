import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Close, Print, Edit, ArrowBack } from '@mui/icons-material';
import { Prescription } from '../../types/prescription';
import PrescriptionForm from '../../components/prescription/PrescriptionForm';
import PrescriptionHistory from '../../components/prescription/PrescriptionHistory';
import PrescriptionView from '../../components/prescription/PrescriptionView';
import { 
  generateAIPrescription, 
  savePrescription, 
  createManualPrescription, 
  getPatientPrescriptions, 
  getPrescriptionById 
} from '../../services/prescriptionService';

const PatientPrescriptionsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const printRef = useRef<HTMLDivElement>(null);
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'view' | 'edit' | 'new' | 'detail'>('view');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch prescriptions on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        setIsLoading(true);
        setError('');
        const response = await getPatientPrescriptions(patientId);
        setPrescriptions(response.data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Handle view prescription in detail
  const handleViewPrescription = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await getPrescriptionById(id);
      setSelectedPrescription(response.data || null);
      setMode('detail');
      
      if (isMobile) {
        setDetailDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching prescription:', err);
      setError('Failed to load prescription details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit prescription
  const handleEditPrescription = (id: string) => {
    const prescription = prescriptions.find(p => p._id === id);
    if (prescription) {
      setSelectedPrescription(prescription);
      setMode('edit');
    }
  };

  // Handle new prescription
  const handleNewPrescription = () => {
    setSelectedPrescription(null);
    setMode('new');
  };

  // Handle back to list view
  const handleBackToList = () => {
    setMode('view');
    setSelectedPrescription(null);
  };

  // Handle generate AI prescription
  const handleGeneratePrescription = async (symptoms: string, medicalHistory: string) => {
    if (!patientId) return null;
    
    try {
      setIsSubmitting(true);
      const result = await generateAIPrescription({ patientId, symptoms, medicalHistory });
      return result.data.aiPrescription;
    } catch (err) {
      console.error('Error generating prescription:', err);
      setError('Failed to generate prescription. Please try again.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save prescription
  const handleSavePrescription = async (data: {
    symptoms: string;
    medicalHistory: string;
    prescription: string;
    useAI?: boolean;
  }) => {
    if (!patientId) return;
    
    try {
      setIsSubmitting(true);
      setError('');

      let updatedPrescription: Prescription | null = null;
      
      if (mode === 'new') {
        if (data.useAI) {
          // This should be handled by the form
          return;
        } else {
          // Create new manual prescription
          const result = await createManualPrescription({
            patientId,
            symptoms: data.symptoms,
            medicalHistory: data.medicalHistory,
            prescription: data.prescription,
          });
          updatedPrescription = result.data || null;
        }
      } else if (mode === 'edit' && selectedPrescription?._id) {
        // Update existing prescription
        const result = await savePrescription({
          prescriptionId: selectedPrescription._id,
          finalPrescription: data.prescription,
          feedback: 'Prescription updated by doctor'
        });
        updatedPrescription = result.data || null;
      } else {
        throw new Error('Invalid operation');
      }

      // Update the prescriptions list if we have a valid prescription
      if (updatedPrescription) {
        // Store in a local constant to maintain type narrowing within the callback
        const updated = updatedPrescription;
        setPrescriptions((prev) => {
          const existingIndex = prev.findIndex(p => p._id === updated._id);
          if (existingIndex >= 0) {
            const updatedList = [...prev];
            updatedList[existingIndex] = updated;
            return updatedList;
          }
          return [updated, ...prev];
        });

        setSelectedPrescription(updated);
      }
      setMode('detail');
      
      if (isMobile) {
        setDetailDialogOpen(true);
      }

      return updatedPrescription;
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Failed to save prescription. Please try again.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Prescription - ${selectedPrescription?.patientId}</title>
              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Roboto', sans-serif; padding: 20px; }
                .prescription-content { max-width: 800px; margin: 0 auto; }
                .prescription-header { margin-bottom: 30px; }
                .prescription-body { margin-bottom: 30px; }
                .prescription-footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                @media print {
                  @page { margin: 0; }
                  body { padding: 20mm; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="prescription-content">
                ${printRef.current.innerHTML}
              </div>
              <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">
                  Print Prescription
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">
                  Close
                </button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
      }
    }
  };

  // Loading state
  if (isLoading && mode !== 'detail') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && mode !== 'detail') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Render the appropriate view based on mode
  return (
    <Container maxWidth="lg" sx={{ py: 4 }} id="prescription-container">
      {/* Header with navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        {mode === 'detail' || mode === 'edit' ? (
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackToList}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
        ) : (
          <Typography variant="h4">
            Patient Prescriptions
          </Typography>
        )}
        
        {mode === 'view' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleNewPrescription}
          >
            New Prescription
          </Button>
        )}
        
        {(mode === 'detail' || mode === 'edit') && selectedPrescription && (
          <Box>
            {mode === 'detail' && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setMode('edit')}
                  sx={{ mr: 2 }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box>
        {mode === 'view' && (
          <PrescriptionHistory
            prescriptions={prescriptions}
            onView={handleViewPrescription}
            onEdit={handleEditPrescription}
            patientId={patientId || ''}
          />
        )}

        {mode === 'new' && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              New Prescription
            </Typography>
            <PrescriptionForm
              patientId={patientId || ''}
              mode="new"
              onSuccess={handleBackToList}
              onCancel={handleBackToList}
            />
          </Paper>
        )}

        {mode === 'edit' && selectedPrescription && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Edit Prescription
            </Typography>
            <PrescriptionForm
              patientId={patientId || ''}
              mode="edit"
              initialData={{
                symptoms: selectedPrescription.symptoms,
                medicalHistory: selectedPrescription.medicalHistory,
                prescription: selectedPrescription.doctorFinalPrescription || selectedPrescription.aiPrescription,
              }}
              onSuccess={handleBackToList}
              onCancel={handleBackToList}
            />
          </Paper>
        )}

        {mode === 'detail' && selectedPrescription && (
          <Box ref={printRef} id="print-prescription">
            <PrescriptionView
              prescription={selectedPrescription}
              onEdit={() => setMode('edit')}
              onBack={handleBackToList}
              printRef={printRef}
            />
          </Box>
        )}
      </Box>

      {/* Mobile dialog for prescription detail */}
      <Dialog
        fullScreen={isMobile}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Prescription Details</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setDetailDialogOpen(false)}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPrescription && (
            <PrescriptionView
              prescription={selectedPrescription}
              onEdit={() => {
                setDetailDialogOpen(false);
                setMode('edit');
              }}
              onBack={() => setDetailDialogOpen(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailDialogOpen(false)}
            color="primary"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Back to List
          </Button>
          <Button
            onClick={handlePrint}
            color="primary"
            variant="contained"
            startIcon={<Print />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientPrescriptionsPage;
