import React from "react";

const OverviewCards = () => {
  const stats = [
    { title: "Patients Seen", value: 128, icon: "bi-people", color: "primary" },
    { title: "Appointments Today", value: 8, icon: "bi-calendar-check", color: "success" },
    { title: "Prescriptions Issued", value: 540, icon: "bi-file-medical", color: "info" },
    { title: "Satisfaction Score", value: "4.9 ★", icon: "bi-star", color: "warning" },
  ];

  return (
    <div className="row g-4">
      {stats.map((s, i) => (
        <div className="col-md-3" key={i}>
          <div className={`card border-0 shadow-sm text-center p-4 bg-white`}>
            <i className={`bi ${s.icon} text-${s.color} fs-2 mb-2`}></i>
            <h6 className="fw-bold">{s.title}</h6>
            <h4 className={`text-${s.color} fw-bold mt-2`}>{s.value}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
