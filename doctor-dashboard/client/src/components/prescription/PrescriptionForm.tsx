import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButtonProps,
  styled,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  Save as SaveIcon, 
  AutoFixHigh as AutoFixHighIcon, 
  Edit as EditIcon, 
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  generateAIPrescription, 
  savePrescription, 
  createManualPrescription,
  validatePrescription
} from '../../services/prescriptionService';
import { PrescriptionFormData, PrescriptionValidationResult } from '../../types/prescription';
import { useAuth } from '../../contexts/AuthContext';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled(({ expand, ...props }: ExpandMoreProps) => {
  return <IconButton {...props} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface PrescriptionFormProps {
  patientId: string;
  mode?: 'new' | 'edit' | 'view';
  initialData?: {
    symptoms?: string;
    medicalHistory?: string;
    prescription?: string;
    prescriptionId?: string;
    isAIGenerated?: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  patientName?: string;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  patientId,
  mode = 'new',
  initialData = {},
  onSuccess,
  onCancel,
  patientName,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PrescriptionValidationResult | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [useAIGeneration, setUseAIGeneration] = useState(!initialData?.prescription);
  const [isAIGenerated, setIsAIGenerated] = useState(initialData?.isAIGenerated || false);
  const [formData, setFormData] = useState<PrescriptionFormData>({
    symptoms: initialData?.symptoms || '',
    medicalHistory: initialData?.medicalHistory || '',
    prescription: initialData?.prescription || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'edit' && initialData?.prescriptionId) {
        await savePrescription({
          id: initialData.prescriptionId,
          content: formData.prescription,
          status: 'FINAL',
          metadata: {
            ...(initialData.isAIGenerated && { isAIGenerated: true }),
            lastEditedBy: user?.id,
            lastEditedAt: new Date().toISOString(),
          },
        });
      } else {
        await createManualPrescription({
          patientId,
          content: formData.prescription,
          metadata: {
            isAIGenerated,
            createdBy: user?.id,
            symptoms: formData.symptoms,
            medicalHistory: formData.medicalHistory,
          },
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving prescription:', error);
      setError('Failed to save prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAIPrescription = async () => {
    if (!formData.symptoms || !formData.medicalHistory) {
      setError('Symptoms and medical history are required to generate a prescription');
      setActiveTab(0); // Switch to the details tab
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateAIPrescription({
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
      });
      
      setFormData(prev => ({
        ...prev,
        prescription: response.data.content,
      }));
      setIsAIGenerated(true);
      setActiveTab(1); // Switch to the prescription tab
    } catch (error) {
      console.error('Error generating AI prescription:', error);
      setError('Failed to generate prescription. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidatePrescription = async () => {
    if (!formData.prescription) {
      setError('Please enter a prescription to validate');
      return;
    }

    setIsValidating(true);
    try {
      const response = await validatePrescription({
        content: formData.prescription,
      });
      setValidationResult(response.data);
      setShowValidationDialog(true);
    } catch (error) {
      console.error('Error validating prescription:', error);
      setError('Failed to validate prescription');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {mode === 'new' ? 'New Prescription' : 'Edit Prescription'}
          {patientName && ` for ${patientName}`}
        </Typography>
        {mode === 'new' && (
          <FormControlLabel
            control={
              <Switch
                checked={useAIGeneration}
                onChange={(e) => setUseAIGeneration(e.target.checked)}
                color="primary"
              />
            }
            label="Use AI Generation"
            labelPlacement="start"
          />
        )}
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Patient Details" />
        <Tab label="Prescription" disabled={!useAIGeneration && mode === 'new'} />
      </Tabs>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Symptoms"
                value={formData.symptoms}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                multiline
                rows={4}
                disabled={mode === 'view'}
                required={useAIGeneration}
                placeholder="Describe the patient's symptoms in detail..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical History"
                value={formData.medicalHistory}
                onChange={(e) =>
                  setFormData({ ...formData, medicalHistory: e.target.value })
                }
                multiline
                rows={5}
                disabled={mode === 'view'}
                required={useAIGeneration}
                placeholder="Include relevant medical history, allergies, current medications..."
              />
            </Grid>
            
            {useAIGeneration && mode === 'new' && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerateAIPrescription}
                  disabled={isGenerating || !formData.symptoms || !formData.medicalHistory}
                  startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                  fullWidth
                  size="large"
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Prescription'}
                </Button>
              </Grid>
            )}
            
            {!useAIGeneration && mode === 'new' && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveTab(1)}
                  disabled={!formData.symptoms || !formData.medicalHistory}
                  fullWidth
                  size="large"
                >
                  Continue to Manual Prescription
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
        
        <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ mr: 1 }}>
                Prescription
              </Typography>
              {isAIGenerated && (
                <Chip
                  icon={<AutoFixHighIcon fontSize="small" />}
                  label="AI Generated"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            
            <TextField
              fullWidth
              value={formData.prescription}
              onChange={(e) =>
                setFormData({ ...formData, prescription: e.target.value })
              }
              multiline
              minRows={12}
              maxRows={20}
              disabled={mode === 'view'}
              required
              placeholder={
                useAIGeneration
                  ? 'The AI will generate a prescription based on the patient details.'
                  : 'Enter the prescription details...'
              }
              sx={{
                fontFamily: '"Roboto Mono", monospace',
                '& .MuiInputBase-root': {
                  p: 2,
                },
              }}
            />
            
            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleValidatePrescription}
                disabled={!formData.prescription || isValidating}
                startIcon={
                  isValidating ? (
                    <CircularProgress size={16} />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
              
              {useAIGeneration && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleGenerateAIPrescription}
                  disabled={isGenerating}
                  startIcon={
                    isGenerating ? (
                      <CircularProgress size={16} />
                    ) : (
                      <AutoFixHighIcon />
                    )
                  }
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              )}
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={() => setActiveTab(0)}
                  startIcon={<EditIcon />}
                >
                  Edit Details
                </Button>
                
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || !formData.prescription}
                    startIcon={
                      isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                  >
                    {isSubmitting ? 'Saving...' : 'Save Prescription'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </form>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Dialog
        open={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {validationResult?.isValid ? (
              <CheckCircleIcon color="success" />
            ) : (
              <WarningIcon color="warning" />
            )}
            Prescription Validation
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {validationResult?.isValid ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                This prescription appears to be valid and follows standard guidelines.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please review the following issues with this prescription:
              </Alert>
            )}
            
            <Box
              component="div"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              {validationResult?.feedback || 'No validation feedback available.'}
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidationDialog(false)} color="primary">
            Close
          </Button>
          {!validationResult?.isValid && (
            <Button
              onClick={() => {
                setShowValidationDialog(false);
                setActiveTab(1);
              }}
              color="primary"
              variant="contained"
            >
              Edit Prescription
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PrescriptionForm;
