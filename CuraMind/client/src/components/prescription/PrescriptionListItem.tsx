import React from 'react';
import { format } from 'date-fns';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
  useTheme,
} from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import { Prescription } from '../../types/prescription';

interface PrescriptionListItemProps {
  prescription: Prescription;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  showActions?: boolean;
}

const PrescriptionListItem: React.FC<PrescriptionListItemProps> = ({
  prescription,
  onView,
  onEdit,
  showActions = true,
}) => {
  const theme = useTheme();
  const isCompleted = prescription.status === 'completed';

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        borderLeft: `4px solid ${
          isCompleted ? theme.palette.success.main : theme.palette.warning.main
        }`,
        mb: 1,
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="subtitle1" fontWeight="medium">
              {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
            </Typography>
            {prescription.isManual ? (
              <Chip
                label="Manual"
                size="small"
                color="secondary"
                variant="outlined"
              />
            ) : (
              <Chip
                label="AI-Generated"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {isCompleted && (
              <Chip
                label="Completed"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 1,
              }}
            >
              {prescription.doctorFinalPrescription || prescription.aiPrescription}
            </Typography>
            {prescription.symptoms && (
              <Typography variant="caption" display="block" color="text.secondary">
                <strong>Symptoms:</strong> {prescription.symptoms}
              </Typography>
            )}
          </>
        }
      />
      {showActions && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="view"
            onClick={() => onView(prescription._id)}
            sx={{ mr: 1 }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => onEdit(prescription._id)}
          >
            <Edit />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default PrescriptionListItem;
