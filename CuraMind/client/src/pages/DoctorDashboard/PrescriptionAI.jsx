import React, { useState } from "react";
import { toast } from 'react-toastify';
import api from '../../services/api';

const PrescriptionAI = () => {
  const [form, setForm] = useState({ patientName: "", symptoms: "" });
  const [aiText, setAiText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.patientName || !form.symptoms) {
      toast.warning('Please enter both patient name and symptoms');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/prescriptions/generate', {
        patientName: form.patientName,
        symptoms: form.symptoms
      });
      
      setAiText(response.data.draft);
      setFinalText(response.data.draft);
      toast.success('Prescription draft generated successfully');
    } catch (error) {
      console.error('Error generating prescription:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate prescription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!finalText) {
      toast.warning('Please generate a prescription first');
      return;
    }

    try {
      await api.post('/api/prescriptions/finalize', {
        patientName: form.patientName,
        symptoms: form.symptoms,
        prescription: finalText
      });
      
      toast.success('Prescription saved successfully');
      // Reset form
      setForm({ patientName: "", symptoms: "" });
      setAiText("");
      setFinalText("");
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save prescription');
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <h5 className="fw-bold text-primary mb-3">AI Prescription Generator</h5>
      <div className="row">
        <div className="col-lg-5">
          <div className="mb-3">
            <label className="form-label fw-bold">Patient Name</label>
            <input
              className="form-control"
              placeholder="Enter patient's full name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Symptoms</label>
            <textarea
              className="form-control"
              rows={5}
              placeholder="Describe symptoms, medical history, and relevant information"
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              disabled={loading}
            ></textarea>
          </div>
          <button
            onClick={handleGenerate}
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : (
              'Generate Prescription'
            )}
          </button>
        </div>

        <div className="col-lg-7 mt-4 mt-lg-0">
          <div className="h-100 d-flex flex-column">
            <div className="mb-2">
              <label className="form-label fw-bold">Prescription Draft</label>
              {aiText ? (
                <textarea
                  className="form-control h-100"
                  style={{ minHeight: '200px' }}
                  value={finalText}
                  onChange={(e) => setFinalText(e.target.value)}
                  disabled={loading}
                ></textarea>
              ) : (
                <div className="card h-100 d-flex align-items-center justify-content-center text-muted p-4" style={{ minHeight: '200px' }}>
                  <div className="text-center">
                    <i className="bi bi-file-earmark-text fs-1 mb-2"></i>
                    <p className="mb-0">Generated prescription will appear here</p>
                  </div>
                </div>
              )}
            </div>
            
            {aiText && (
              <button
                onClick={handleFinalize}
                className="btn btn-success w-100 mt-3"
                disabled={loading}
              >
                <i className="bi bi-check-circle me-2"></i>
                Save Final Prescription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionAI;
