import { Request, Response } from 'express';
import { AIPrescriptionService } from '../services/aiPrescription';
import { prisma } from '../utils/prisma';

const aiPrescriptionService = new AIPrescriptionService();

export const generatePrescription = async (req: Request, res: Response) => {
  try {
    const { symptoms, medicalHistory } = req.body;
    const doctorId = req.user?.id; // Assuming you have authentication middleware

    if (!symptoms || !medicalHistory) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms and medical history are required',
      });
    }

    const { content, aiContext } = await aiPrescriptionService.generatePrescription(
      symptoms,
      medicalHistory,
      doctorId
    );

    // Create a draft prescription
    const prescription = await prisma.prescription.create({
      data: {
        content,
        status: 'DRAFT',
        doctorId,
        patientId: req.body.patientId,
        metadata: {
          aiContext,
          symptoms,
          medicalHistory,
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...prescription,
        isAIGenerated: true,
      },
    });
  } catch (error) {
    console.error('Error generating prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prescription',
    });
  }
};

export const savePrescription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, status = 'FINAL' } = req.body;
    const doctorId = req.user?.id;

    // Get the existing prescription
    const existing = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found',
      });
    }

    // If this was an AI-generated prescription that was edited, learn from the changes
    if (existing.metadata?.aiContext && existing.content !== content) {
      await aiPrescriptionService.learnFromEdit(
        existing.content,
        content,
        doctorId,
        existing.metadata.aiContext
      );
    }

    // Update the prescription
    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        content,
        status,
        metadata: {
          ...existing.metadata,
          lastEditedAt: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save prescription',
    });
  }
};

export const createManualPrescription = async (req: Request, res: Response) => {
  try {
    const { patientId, content } = req.body;
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
        status: 'FINAL',
        doctorId,
        patientId,
        metadata: {
          isManual: true,
          createdAt: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Error creating manual prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual prescription',
    });
  }
};

export const validatePrescription = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Prescription content is required',
      });
    }

    const validation = await aiPrescriptionService.validatePrescription(content);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('Error validating prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate prescription',
    });
  }
};
