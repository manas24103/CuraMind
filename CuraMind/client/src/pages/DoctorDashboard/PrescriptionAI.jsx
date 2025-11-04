import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { patientAPI } from '../../services/api';
import { doctorAPI } from '../../services/api';

const PrescriptionAI = () => {
  const [form, setForm] = useState({ 
    patientName: '', 
    symptoms: '',
    diagnosis: '',
    medication: '',
    dosage: '',
    duration: '',
    notes: '',
    followUpDate: ''
  });
  
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [suggestedDiagnoses, setSuggestedDiagnoses] = useState([]);

  const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
  const doctorId = doctorInfo?._id;

  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        const response = await patientAPI.getRecentPatients(doctorId);
        setRecentPatients(response.data);
      } catch (error) {
        console.error('Error fetching recent patients:', error);
      }
    };

    fetchRecentPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Show diagnosis suggestions when symptoms change
    if (name === 'symptoms' && value.length > 3) {
      suggestDiagnosis(value);
    }
  };

  const suggestDiagnosis = async (symptoms) => {
    try {
      const response = await doctorAPI.post('/doctor/ai/suggest-diagnosis', { symptoms });
      setSuggestedDiagnoses(response.data.suggestions || []);
    } catch (error) {
      console.error('Error getting diagnosis suggestions:', error);
    }
  };

  const selectPatient = (patient) => {
    setForm(prev => ({
      ...prev,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    }));
    setShowPatientDropdown(false);
  };

  const selectDiagnosis = (diagnosis) => {
    setForm(prev => ({
      ...prev,
      diagnosis,
      symptoms: prev.symptoms // Keep existing symptoms
    }));
    setSuggestedDiagnoses([]);
  };

  const handleGenerate = async () => {
    if (!form.patientName || !form.symptoms) {
      toast.warning('Please enter patient name and symptoms');
      return;
    }

    try {
      setLoading(true);
      const response = await doctorAPI.post('/doctor/ai/generate-prescription', {
        patientName: form.patientName,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis
      });
      
      const { prescription, structuredData } = response.data;
      setAiText(prescription);
      
      // Update form with structured data if available
      if (structuredData) {
        setForm(prev => ({
          ...prev,
          medication: structuredData.medication || '',
          dosage: structuredData.dosage || '',
          duration: structuredData.duration || '',
          notes: structuredData.notes || ''
        }));
      }
      
      setIsEditing(true);
      toast.success('Prescription draft generated successfully');
    } catch (error) {
      console.error('Error generating prescription:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate prescription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!form.patientName || !form.symptoms || !form.diagnosis) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await doctorAPI.post('/doctor/prescriptions', {
        patientName: form.patientName,
        patientId: form.patientId,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        medication: form.medication,
        dosage: form.dosage,
        duration: form.duration,
        notes: form.notes,
        followUpDate: form.followUpDate,
        prescriptionText: aiText
      });
      
      toast.success('Prescription saved successfully');
      resetForm();
    } catch (error) {
      console.error('Error saving prescription:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save prescription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      patientName: '',
      symptoms: '',
      diagnosis: '',
      medication: '',
      dosage: '',
      duration: '',
      notes: '',
      followUpDate: ''
    });
    setAiText('');
    setIsEditing(false);
    setSuggestedDiagnoses([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI-Powered Prescription Generator</h2>
        {isEditing && (
          <button 
            onClick={resetForm}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Prescription
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Search or enter patient name"
                value={form.patientName}
                onChange={(e) => {
                  handleInputChange(e);
                  setShowPatientDropdown(true);
                }}
                disabled={loading || isEditing}
                autoComplete="off"
              />
              {showPatientDropdown && recentPatients.length > 0 && !isEditing && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                  {recentPatients.map(patient => (
                    <div 
                      key={patient._id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => {
                        selectPatient(patient);
                        setShowPatientDropdown(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">{`${patient.firstName} ${patient.lastName}`}</div>
                      <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows="3"
              placeholder="Enter patient symptoms"
              name="symptoms"
              value={form.symptoms}
              onChange={handleInputChange}
              disabled={loading || isEditing}
            ></textarea>
            {suggestedDiagnoses.length > 0 && !isEditing && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Suggested Diagnoses:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedDiagnoses.map((diag, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={() => selectDiagnosis(diag)}
                    >
                      {diag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter diagnosis"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleInputChange}
              disabled={loading || isEditing}
            />
          </div>

          {!isEditing && (
            <button
              className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                loading || !form.patientName || !form.symptoms
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handleGenerate}
              disabled={loading || !form.patientName || !form.symptoms}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Prescription
                </>
              )}
            </button>
          )} 

          {isEditing && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Review and edit the AI-generated prescription below. Make any necessary changes before saving.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Amoxicillin 500mg"
                  name="medication"
                  value={form.medication}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 1 tablet"
                    name="dosage"
                    value={form.dosage}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 7 days"
                    name="duration"
                    value={form.duration}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows="3"
                  placeholder="Additional instructions..."
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  disabled={loading}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  name="followUpDate"
                  value={form.followUpDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                  onClick={handleSavePrescription}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Prescription
                    </>
                  )}
                </button>
                <button
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Back to Edit
                </button>
              </div>
            </div>
          )} 

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">AI-Generated Prescription</h3>
                {aiText && (
                  <button 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      navigator.clipboard.writeText(aiText);
                      toast.success('Prescription copied to clipboard');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                )}
              </div>
              <div className="p-6 flex-1 overflow-auto">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-sm text-gray-500">Generating prescription...</p>
                  </div>
                ) : aiText ? (
                  <div className="prose max-w-none text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
                    {aiText}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-700 mb-1">No prescription generated yet</h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Enter patient details and symptoms, then click "Generate Prescription" to create a new prescription.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionAI;
