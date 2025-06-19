import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';
import { Edit, Print, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import { Prescription } from '../../types/prescription';

interface PrescriptionViewProps {
  prescription: Prescription;
  onEdit: () => void;
  onBack: () => void;
  printRef?: React.RefObject<HTMLDivElement>;
}

const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescription,
  onEdit,
  onBack,
  printRef,
}) => {
  const theme = useTheme();
  const isCompleted = prescription.status === 'completed';

  return (
    <Box>
      {/* Buttons (not printed) */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="no-print">
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mr: 2 }}>
          Back to List
        </Button>
        <Box>
          <Button variant="outlined" startIcon={<Edit />} onClick={onEdit} sx={{ mr: 2 }}>
            Edit
          </Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>
            Print
          </Button>
        </Box>
      </Box>

      {/* Prescription Content */}
      <Paper
        id="print-prescription"
        ref={printRef}
        elevation={3}
        sx={{
          p: 4,
          position: 'relative',
          borderLeft: `4px solid ${isCompleted ? theme.palette.success.main : theme.palette.warning.main}`,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Medical Prescription
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Date: {format(new Date(prescription.createdAt), 'MMMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Status:{' '}
              <Chip
                label={isCompleted ? 'Completed' : 'Draft'}
                size="small"
                color={isCompleted ? 'success' : 'warning'}
                variant="outlined"
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
              />
            </Typography>
          </Box>
          <Chip
            label={prescription.isManual ? 'Manually Created' : 'AI-Generated'}
            color={prescription.isManual ? 'secondary' : 'primary'}
            variant="outlined"
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                SYMPTOMS
              </Typography>
              <Typography variant="body1" whiteSpace="pre-line">
                {prescription.symptoms || 'No symptoms recorded'}
              </Typography>
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                MEDICAL HISTORY
              </Typography>
              <Typography variant="body1" whiteSpace="pre-line">
                {prescription.medicalHistory || 'No medical history recorded'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                borderLeft: `3px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                PRESCRIPTION
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{ whiteSpace: 'pre-line', '& p': { margin: 0, marginBottom: 1 } }}
                dangerouslySetInnerHTML={{
                  __html: (prescription.doctorFinalPrescription || prescription.aiPrescription || 'No prescription details available').replace(/\n/g, '<br />'),
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {prescription.feedback && (
          <Box mt={3} pt={2} borderTop={`1px dashed ${theme.palette.divider}`}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              DOCTOR'S NOTES
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {prescription.feedback}
            </Typography>
          </Box>
        )}

        <Box mt={4} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                Doctor: Dr. [Doctor Name]
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                License: [License Number]
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-prescription, #print-prescription * {
              visibility: visible;
            }
            #print-prescription {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default PrescriptionView;
