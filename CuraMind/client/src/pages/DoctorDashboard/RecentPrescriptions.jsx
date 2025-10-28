import React from "react";

const RecentPrescriptions = () => {
  const prescriptions = [
    {
      patient: "Alice Johnson",
      symptoms: "Fever, headache, fatigue",
      date: "27 Oct 2025",
      medicine: "Paracetamol 500mg, 3x daily",
    },
    {
      patient: "David Smith",
      symptoms: "Cough, cold, sore throat",
      date: "26 Oct 2025",
      medicine: "Cough syrup, 2 tsp 3x daily",
    },
  ];

  return (
    <div className="card p-4 shadow-sm">
      <h5 className="fw-bold text-primary mb-3">Recent Prescriptions</h5>
      <ul className="list-group">
        {prescriptions.map((p, i) => (
          <li
            key={i}
            className="list-group-item d-flex justify-content-between align-items-start"
          >
            <div>
              <div className="fw-bold">{p.patient}</div>
              <small className="text-muted">{p.symptoms}</small>
              <div className="small mt-1">
                <strong>Prescription:</strong> {p.medicine}
              </div>
            </div>
            <span className="badge bg-primary rounded-pill">{p.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentPrescriptions;
