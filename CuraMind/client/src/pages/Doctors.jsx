import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

const Doctors = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const doctors = [
    {
      name: "Dr. Sarah Mitchell",
      specialty: "Cardiology",
      experience: "15+ years experience",
      rating: 4.9,
      status: "Available",
      image: "https://bootstrapmade.com/demo/templates/Medilab/assets/img/doctors/doctors-1.jpg"
    },
    {
      name: "Dr. Michael Rodriguez",
      specialty: "Neurology",
      experience: "12+ years experience",
      rating: 4.7,
      status: "In Surgery",
      image: "https://bootstrapmade.com/demo/templates/Medilab/assets/img/doctors/doctors-2.jpg"
    },
    {
      name: "Dr. Emily Chen",
      specialty: "Pediatrics",
      experience: "8+ years experience",
      rating: 5.0,
      status: "Available",
      image: "https://bootstrapmade.com/demo/templates/Medilab/assets/img/doctors/doctors-3.jpg"
    },
    {
      name: "Dr. James Thompson",
      specialty: "Orthopedics",
      experience: "20+ years experience",
      rating: 4.8,
      status: "Next: Tomorrow 9AM",
      image: "https://bootstrapmade.com/demo/templates/Medilab/assets/img/doctors/doctors-4.jpg"
    },
    {
      name: "Dr. Lisa Anderson",
      specialty: "Dermatology",
      experience: "10+ years experience",
      rating: 4.6,
      status: "Available",
      image: "https://bootstrapmade.com/demo/templates/Medilab/assets/img/doctors/doctors-5.jpg"
    },
    {
      name: "Dr. Robert Kim",
      specialty: "Oncology",
      experience: "18+ years experience",
      rating: 4.9,
      status: "Available",
      image: "https://bootstrapmade.com/demo/templates/Medilab/assets/img/doctors/doctors-6.jpg"
    }
  ];

  return (
    <>
      <Header />

      {/* ======= Page Title ======= */}
      <section className="bg-light py-5 mt-5 text-center">
        <div className="container" data-aos="fade-up">
          <h2 className="fw-bold text-primary">Our Doctors</h2>
          <p className="text-muted mt-2">
            Meet our team of expert healthcare professionals dedicated to your well-being.
          </p>
        </div>
      </section>

      {/* ======= Doctors Section ======= */}
      <section className="container my-5" data-aos="fade-up">
        <div className="row g-4">
          {doctors.map((doc, i) => (
            <div className="col-md-4 col-lg-3" key={i}>
              <div className="card border-0 shadow-sm h-100 text-center">
                <img
                  src={doc.image}
                  className="card-img-top rounded-top"
                  alt={doc.name}
                  style={{ height: "240px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h6 className="fw-bold text-primary mb-1">{doc.name}</h6>
                  <p className="text-muted small mb-1">{doc.specialty}</p>
                  <p className="small mb-1">{doc.experience}</p>
                  <div className="text-warning mb-2">
                    {"★".repeat(Math.round(doc.rating))}{" "}
                    <small className="text-muted">({doc.rating})</small>
                  </div>
                  <span
                    className={`badge ${
                      doc.status.includes("Available")
                        ? "bg-success"
                        : doc.status.includes("In Surgery")
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Doctors;
