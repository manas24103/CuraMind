import Patient from '../models/patient.js';

export class PatientController {
    async getAllPatients(req, res) {
        try {
            console.log('Fetching all patients...');
            const patients = await Patient.find().lean();
            console.log(`Found ${patients.length} patients`);
            
            // Format the response consistently
            const response = {
                success: true,
                count: patients.length,
                data: patients
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error in getAllPatients:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error fetching patients',
                error: error.message 
            });
        }
    }

    async getPatientById(req, res) {
        try {
            const patient = await Patient.findById(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json(patient);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching patient', error });
        }
    }

    async createPatient(req, res) {
        try {
            const patient = new Patient(req.body);
            const savedPatient = await patient.save();
            res.status(201).json(savedPatient);
        } catch (error) {
            res.status(400).json({ message: 'Error creating patient', error });
        }
    }

    async updatePatient(req, res) {
        try {
            const patient = await Patient.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json(patient);
        } catch (error) {
            res.status(400).json({ message: 'Error updating patient', error });
        }
    }

    async deletePatient(req, res) {
        try {
            const patient = await Patient.findByIdAndDelete(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json({ message: 'Patient deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting patient', error });
        }
    }
}

const patientController = new PatientController();
export default patientController;
