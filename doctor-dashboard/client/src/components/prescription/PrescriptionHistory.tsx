import React from 'react';
import { List, Paper, Typography, Box } from '@mui/material';
import { Prescription } from '../../types/prescription';
import PrescriptionListItem from './PrescriptionListItem';

interface PrescriptionHistoryProps {
  prescriptions: Prescription[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  patientId: string;
  showActions?: boolean;
}

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({
  prescriptions,
  onView,
  onEdit,
  patientId,
  showActions = true,
}) => {
  if (prescriptions.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prescription History
        </Typography>
        <Typography color="textSecondary">
          No prescriptions found for this patient.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Prescription History
      </Typography>
      <List disablePadding>
        {prescriptions.map((prescription, index) => (
          <Box key={prescription._id} mb={index < prescriptions.length - 1 ? 2 : 0}>
            <PrescriptionListItem
              prescription={prescription}
              onView={onView}
              onEdit={onEdit}
              showActions={showActions}
            />
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default PrescriptionHistory;
