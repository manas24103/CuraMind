import Prescription from '../models/Prescription.js';
/**
 * Generate AI prescription using OpenAI/Gemini
 */
export const generateAIPrescription = async (req, res) => {
  try {
    const { symptoms, medicalHistory, patientId } = req.body;
    const doctorId = req.doctor?._id;

    if (!symptoms) {
      return res.status(400).json({ 
        success: false, 
        message: 'Symptoms are required' 
      });
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a medical assistant AI that generates safe, professional prescriptions based on symptoms and patient history.',
          },
          {
            role: 'user',
            content: `Symptoms: ${symptoms}. Medical history: ${medicalHistory || 'N/A'}. Generate a professional prescription with medicine name, dosage, and precautions.`,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiText = response.data.choices[0].message.content;

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      symptoms,
      medicalHistory: medicalHistory || '',
      content: aiText,
      isFinal: false,
    });

    res.json({ 
      success: true, 
      data: prescription 
    });
  } catch (error) {
    console.error('Error generating AI prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Alias for backward compatibility
export const generatePrescription = generateAIPrescription;

/**
 * Save or update prescription
 */
export const savePrescription = async (req, res) => {
  try {
    const { content, patientId, isFinal, prescriptionId } = req.body;
    const doctorId = req.doctor?._id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    let prescription;
    
    if (prescriptionId) {
      // Update existing prescription
      prescription = await Prescription.findByIdAndUpdate(
        prescriptionId,
        { 
          content, 
          isFinal: isFinal || false,
          updatedAt: Date.now()
        },
        { new: true }
      );
    } else if (patientId) {
      // Create new prescription
      prescription = await Prescription.create({
        patientId,
        doctorId,
        content,
        isFinal: isFinal || false,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either prescriptionId or patientId is required',
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
      message: 'Failed to save prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create manual prescription
 */
export const createManualPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, content, isFinal = false } = req.body;

    // Create the prescription
    const prescription = await Prescription.create({
      patientId,
      doctorId,
      content,
      isFinal,
      isManual: true,
    });

    res.status(201).json({
      success: true,
      data: prescription
    });
    
  } catch (error) {
    console.error('Error creating manual prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get patient's prescription history
 */
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required',
      });
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email dateOfBirth gender')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email dateOfBirth gender');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
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
      message: 'Failed to fetch prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Finalize prescription
 */
export const finalizePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { 
        content,
        isFinal: true,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('doctorId', 'name email')
    .populate('patientId', 'name email');

    if (!updatedPrescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    res.json({
      success: true,
      data: updatedPrescription,
    });
  } catch (error) {
    console.error('Error finalizing prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to finalize prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Validate prescription content
 */
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions,
      count: prescriptions.length
    });
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

export const validatePrescription = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Add your validation logic here
    const isValid = content.trim().length > 0;
    const validationMessage = isValid ? 'Prescription is valid' : 'Prescription cannot be empty';

    res.json({
      success: true,
      data: {
        isValid,
        message: validationMessage,
      },
    });
  } catch (error) {
    console.error('Error validating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
