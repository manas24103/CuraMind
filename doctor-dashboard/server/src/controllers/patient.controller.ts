import { Request, Response } from 'express';
import { Patient } from '../models/patient.model';

export class PatientController {
    async getAllPatients(req: Request, res: Response) {
        try {
            const patients = await Patient.find();
            res.json(patients);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching patients', error });
        }
    }

    async getPatientById(req: Request, res: Response) {
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

    async createPatient(req: Request, res: Response) {
        try {
            const patient = new Patient(req.body);
            await patient.save();
            res.status(201).json(patient);
        } catch (error) {
            res.status(400).json({ message: 'Error creating patient', error });
        }
    }

    async updatePatient(req: Request, res: Response) {
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

    async deletePatient(req: Request, res: Response) {
        try {
            const patient = await Patient.findByIdAndDelete(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.status(204).json({ message: 'Patient deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting patient', error });
        }
    }
}

export const patientController = new PatientController();
