import { AIPrescriptionService } from '../services/aiPrescription.js';
import { prisma } from '../utils/prisma.js';

const aiPrescriptionService = new AIPrescriptionService();

/**
 * Generate AI prescription
 * Combines functionality from both original implementations
 */
export const generateAIPrescription = async (req, res) => {
  try {
    const { symptoms, medicalHistory } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const doctorId = userId; // For backward compatibility

    if (!symptoms || !medicalHistory) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms and medical history are required',
      });
    }

    const result = await aiPrescriptionService.generatePrescription(
      symptoms,
      medicalHistory,
      userId || doctorId,
      userRole
    );

    res.json({
      success: true,
      data: {
        content: result.content,
        aiContext: result.aiContext,
      },
    });
  } catch (error) {
    console.error('Error generating AI prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prescription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Alias for backward compatibility
export const generatePrescription = generateAIPrescription;

/**
 * Save prescription - combines both implementations
 */
export const savePrescription = async (req, res) => {
  try {
    const { content, patientId, isFinal, prescriptionId } = req.body;
    const doctorId = req.user?.id;

    // Handle both implementations' requirements
    if ((!prescriptionId && !patientId) || !content) {
      return res.status(400).json({
        success: false,
        error: prescriptionId ? 'Content is required' : 'Content and patient ID are required',
      });
    }

    let prescription;
    
    if (prescriptionId) {
      // Update existing prescription
      prescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          content,
          isFinal: isFinal || false,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new prescription
      prescription = await prisma.prescription.create({
        data: {
          content,
          doctorId,
          patientId,
          isFinal: isFinal || false,
        },
      });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save prescription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create manual prescription - combines both implementations
 */
export const createManualPrescription = async (req, res) => {
  try {
    const { patientId, content, isFinal = true } = req.body;
    const doctorId = req.user?.id;

    if (!patientId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID and content are required',
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        content,
        doctorId,
        patientId,
        isFinal,
        isManual: true,
      },
    });

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Error creating manual prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual prescription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get patient's prescription history
 */
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.prescription.count({ where: { patientId } });

    res.json({
      success: true,
      data: {
        prescriptions,
        total,
        hasMore: total > parseInt(offset) + prescriptions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient prescriptions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found',
      });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prescription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Validate prescription content
 */
export const validatePrescription = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    // Basic validation
    const isValid = content.trim().length > 0;
    const errors = [];

    if (!isValid) {
      errors.push('Prescription content cannot be empty');
    }

    // Add more validation rules as needed
    if (content.length < 10) {
      errors.push('Prescription content is too short');
    }

    res.json({
      success: true,
      data: {
        isValid: errors.length === 0,
        errors,
      },
    });
  } catch (error) {
    console.error('Error validating prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate prescription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
