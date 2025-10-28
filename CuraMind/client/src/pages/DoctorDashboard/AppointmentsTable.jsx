import React from "react";

const AppointmentsTable = () => {
  const appointments = [
    { name: "John Carter", date: "28 Oct 2025", time: "10:30 AM", status: "Confirmed" },
    { name: "Emma Brown", date: "28 Oct 2025", time: "12:00 PM", status: "Pending" },
    { name: "Robert Wilson", date: "29 Oct 2025", time: "09:15 AM", status: "Cancelled" },
  ];

  return (
    <div className="card p-4 shadow-sm">
      <h5 className="fw-bold text-primary mb-3">Upcoming Appointments</h5>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a, i) => (
              <tr key={i}>
                <td>{a.name}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <span
                    className={`badge ${
                      a.status === "Confirmed"
                        ? "bg-success"
                        : a.status === "Pending"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsTable;
