import { Request, Response } from 'express';
import { AIPrescriptionService } from '../services/aiPrescription';
import { prisma } from '../utils/prisma';
import { PrescriptionStatus, UserRole } from '@prisma/client';

const aiPrescriptionService = new AIPrescriptionService();

// Extend the Express Request type to include user info from your auth middleware
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: UserRole;
    [key: string]: any;
  };
};

// Define the response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generate AI prescription
export const generateAIPrescription = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    const { symptoms, medicalHistory = '', patientId } = req.body;
    
    if (!symptoms || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms and patient ID are required',
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Generate AI prescription
    const { content: aiPrescription, aiContext } = await aiPrescriptionService.generatePrescription(
      symptoms,
      medicalHistory,
      req.user?.id
    );

    // Create a draft prescription
    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId: req.user.id,
        content: aiPrescription,
        status: 'DRAFT',
        createdBy: req.user.id,
        metadata: {
          isAIGenerated: true,
          aiContext,
          symptoms,
          medicalHistory,
        },
      },
      include: {
        patient: {
          select: { name: true, email: true }
        },
        doctor: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ...prescription,
        isAIGenerated: true,
      },
      message: 'AI prescription generated successfully',
    });
  } catch (error) {
    console.error('Error generating AI prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI prescription',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Save final prescription
export const savePrescription = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id: prescriptionId } = req.params;
    
    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Prescription ID is required',
      });
    }
    const { content, status = 'FINAL' as const } = req.body;

    // Get the existing prescription
    const existing = await prisma.prescription.findUnique({
      where: { id: parseInt(prescriptionId) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Validate doctor ownership
    if (existing.doctorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prescription',
      });
    }

    // If this was an AI-generated prescription that was edited, learn from the changes
    const metadata = existing.metadata as any;
    if (metadata?.aiContext && existing.content !== content) {
      await aiPrescriptionService.learnFromEdit(
        existing.content,
        content,
        req.user.id,
        metadata.aiContext
      );
    }

    // Update the prescription
    const updated = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        content,
        status,
        updatedBy: req.user.id,
        metadata: {
          ...(existing.metadata as any || {}),
          lastEditedAt: new Date().toISOString(),
        } as any,
      },
      include: {
        patient: {
          select: { name: true, email: true }
        },
        doctor: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Prescription saved successfully',
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save prescription',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create manual prescription
export const createManualPrescription = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    // Check if user is authenticated and is a doctor
    if (!req.user || req.user.role !== 'DOCTOR') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only doctors can generate prescriptions' 
      });
    }

    const { patientId, content, metadata = {} } = req.body;

    if (!patientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and prescription content are required',
      });
    }

    const newPrescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId: req.user.id,
        content,
        status: 'FINAL',
        createdBy: req.user.id,
        metadata: {
          ...metadata,
          isManual: true,
          createdAt: new Date().toISOString(),
        },
      },
      include: {
        patient: {
          select: { name: true, email: true }
        },
        doctor: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newPrescription,
      message: 'Manual prescription created successfully',
    });
  } catch (error) {
    console.error('Error creating manual prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual prescription',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get patient's prescription history
export const getPatientPrescriptions = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required',
      });
    }

    // Check if user is authorized (doctor viewing their patient or patient viewing their own)
    if (req.user?.role !== 'ADMIN' && 
        (req.user?.role === 'DOCTOR' && !req.query.patientId) ||
        (req.user?.role === 'PATIENT' && req.user.id !== patientId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these prescriptions',
      });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: { name: true, email: true }
        },
        patient: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: prescriptions,
      message: 'Prescriptions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Prescription ID is required',
      });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { name: true, email: true }
        },
        patient: {
          select: { name: true, email: true }
        },
        creator: {
          select: { name: true, email: true }
        },
        updater: {
          select: { name: true, email: true }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Check if user is authorized (doctor who created it, the patient, or admin)
    if (req.user?.role !== 'ADMIN' && 
        req.user?.id !== prescription.doctorId && 
        req.user?.id !== prescription.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this prescription',
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
      message: 'Prescription retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Validate prescription content
export const validatePrescription = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Prescription content is required',
      });
    }

    const validation = await aiPrescriptionService.validatePrescription(content);

    res.status(200).json({
      success: true,
      data: validation,
      message: 'Prescription validated successfully',
    });
  } catch (error) {
    console.error('Error validating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate prescription',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
