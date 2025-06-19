import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, ArrowBack } from '@mui/icons-material';
import { Prescription } from '../../types/prescription';
import PrescriptionForm from '../../components/prescription/PrescriptionForm';
import PrescriptionView from '../../components/prescription/PrescriptionView';
import PrescriptionHistory from '../../components/prescription/PrescriptionHistory';
import { getPatientPrescriptions, getPrescriptionById } from '../../services/prescriptionService';

const PrescriptionPage: React.FC = () => {
  const { patientId, prescriptionId } = useParams<{ 
    patientId: string; 
    prescriptionId?: string 
  }>();
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch prescriptions when patientId changes
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) return;
      
      try {
        setIsLoading(true);
        const response = await getPatientPrescriptions(patientId);
        
        if (response.success && response.data) {
          setPrescriptions(response.data);
          
          // If there's a prescriptionId in the URL, select that prescription
          if (prescriptionId) {
            const selected = response.data.find(p => p._id === prescriptionId);
            if (selected) {
              setSelectedPrescription(selected);
              setIsViewMode(true);
            }
          }
        } else {
          setError(response.message || 'Failed to load prescriptions');
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('An error occurred while loading prescriptions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [patientId, prescriptionId]);

  // Handle prescription selection
  const handleViewPrescription = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await getPrescriptionById(id);
      
      if (response.success && response.data) {
        setSelectedPrescription(response.data);
        setIsViewMode(true);
        navigate(`/patients/${patientId}/prescriptions/${id}`);
      } else {
        setError(response.message || 'Failed to load prescription');
      }
    } catch (err) {
      console.error('Error fetching prescription:', err);
      setError('An error occurred while loading the prescription');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit prescription
  const handleEditPrescription = (id: string) => {
    navigate(`/patients/${patientId}/prescriptions/${id}/edit`);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedPrescription(null);
    setIsViewMode(false);
    navigate(`/patients/${patientId}/prescriptions`);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    // Refresh the prescriptions list
    if (patientId) {
      getPatientPrescriptions(patientId).then(response => {
        if (response.success && response.data) {
          setPrescriptions(response.data);
        }
      });
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
              <title>Prescription - ${(selectedPrescription?.patientId && typeof selectedPrescription.patientId === 'object') ? selectedPrescription.patientId.name : 'Patient'}</title>
              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Roboto', sans-serif; padding: 20px; }
                .no-print { display: none; }
                @page { size: auto; margin: 0; }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.onafterprint = function() { window.close(); };
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (!patientId) {
    return (
      <Container maxWidth="lg">
        <Typography color="error">Patient ID is required</Typography>
      </Container>
    );
  }

  if (isLoading && !selectedPrescription) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          {isViewMode && (
            <Tooltip title="Back to list">
              <IconButton onClick={handleBackToList} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h4" component="h1">
            {isViewMode 
              ? 'Prescription Details' 
              : 'Prescription Management'}
          </Typography>
        </Box>
        
        {!isViewMode && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
          >
            New Prescription
          </Button>
        )}
      </Box>

      {isViewMode && selectedPrescription ? (
        <PrescriptionView
          prescription={selectedPrescription}
          onEdit={() => handleEditPrescription(selectedPrescription._id)}
          onBack={handleBackToList}
          printRef={printRef}
        />
      ) : (
        <PrescriptionHistory
          prescriptions={prescriptions}
          onView={handleViewPrescription}
          onEdit={handleEditPrescription}
          patientId={patientId}
          showActions={true}
        />
      )}

      {/* New Prescription Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>New Prescription</DialogTitle>
        <DialogContent dividers>
          <PrescriptionForm
            patientId={patientId}
            mode="new"
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PrescriptionPage;
