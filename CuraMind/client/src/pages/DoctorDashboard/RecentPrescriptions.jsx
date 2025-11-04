import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';

const RecentPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPrescription, setExpandedPrescription] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await api.get('prescriptions/recent');
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const togglePrescription = (id) => {
    setExpandedPrescription(expandedPrescription === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Prescriptions</h2>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Refresh
        </button>
      </div>
      
      {prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No prescriptions found</h3>
          <p className="mt-1 text-gray-500">There are no recent prescriptions to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div 
              key={prescription._id} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => togglePrescription(prescription._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-blue-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {prescription.patientName || 'Unnamed Patient'}
                      </h3>
                      {prescription.diagnosis && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                          {prescription.diagnosis}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {formatDate(prescription.createdAt)}
                  </span>
                </div>
                
                <p className={`mt-2 text-sm text-gray-600 ${expandedPrescription !== prescription._id ? 'line-clamp-2' : ''}`}>
                  {prescription.notes || 'No additional notes'}
                </p>
                
                {prescription.notes && prescription.notes.length > 100 && (
                  <button 
                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePrescription(prescription._id);
                    }}
                  >
                    {expandedPrescription === prescription._id ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
              
              {expandedPrescription === prescription._id && (
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Prescription Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Medication</p>
                      <div className="p-2 bg-white rounded border text-sm">
                        {prescription.medication || 'No medication specified'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Dosage</p>
                      <div className="p-2 bg-white rounded border text-sm">
                        {prescription.dosage || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Duration</p>
                      <div className="p-2 bg-white rounded border text-sm">
                        {prescription.duration || 'Not specified'}
                      </div>
                    </div>
                    {prescription.followUpDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Follow-up Date</p>
                        <div className="p-2 bg-white rounded border text-sm">
                          {formatDate(prescription.followUpDate)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                    <span>Click to collapse details</span>
                    <span className="text-gray-700">
                      Created: {formatDate(prescription.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPrescriptions;
