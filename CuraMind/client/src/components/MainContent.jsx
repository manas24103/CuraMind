import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHeartbeat, FaUserMd, FaStethoscope, FaAmbulance, FaBone 
} from 'react-icons/fa';
import { 
  BsCheckCircleFill, BsTelephoneFill, BsGeoAltFill, BsChatDotsFill 
} from 'react-icons/bs';

// === Department and Service Data ===
const featuredDepartments = [
  { title: "Cardiology", desc: "Comprehensive cardiovascular care with advanced diagnostic techniques...", icon: <FaHeartbeat /> },
  { title: "Neurology", desc: "Expert neurological care specializing in brain and nervous system disorders...", icon: <FaStethoscope /> },
  { title: "Orthopedics", desc: "Advanced musculoskeletal care focusing on bones, joints, and muscles...", icon: <FaBone /> },
  { title: "Pediatrics", desc: "Specialized healthcare for children from infancy through adolescence...", icon: <FaUserMd /> },
  { title: "Oncology", desc: "Comprehensive cancer care with multidisciplinary approach...", icon: <FaAmbulance /> },
  { title: "Emergency Care", desc: "Round-the-clock emergency medical services with rapid response...", icon: <FaAmbulance /> },
];

const featuredServices = [
  {
    title: "Cardiology Excellence",
    icon: FaHeartbeat,
    desc: "Advanced cardiac treatments with modern surgical and diagnostic methods.",
    points: ["Heart Surgery", "Preventive Screenings", "Diagnostic Imaging"]
  },
  {
    title: "Neurology & Brain Health",
    icon: FaStethoscope,
    desc: "Expert care for brain, spine, and nervous system disorders.",
    points: ["Neuroimaging", "Stroke Care", "Rehabilitation"]
  },
  {
    title: "Orthopedic Surgery",
    icon: FaBone,
    desc: "Comprehensive bone, joint, and spine care using latest technology.",
    points: ["Joint Replacement", "Sports Medicine", "Minimally Invasive Procedures"]
  },
  {
    title: "Emergency & Trauma Care",
    icon: FaAmbulance,
    desc: "Immediate medical response for critical and trauma cases 24/7.",
    points: ["24/7 Emergency Dept.", "Level 1 Trauma Unit", "Critical Care Units"]
  }
];

const emergencyContacts = [
  { title: "Emergency Room", phone: "+1 (555) 123-4567", details: "1245 Healthcare Blvd, Medical City, CA 90210\nOpen 24/7", color: 'red' },
  { title: "Urgent Care", phone: "+1 (555) 987-6543", details: "892 Wellness Ave, Health District, CA 90211\nMon-Sun: 7:00 AM - 10:00 PM", color: 'blue' },
  { title: "Nurse Helpline", phone: "+1 (555) 456-7890", details: "24/7 medical advice and guidance\nAvailable 24/7", color: 'blue' },
  { title: "Poison Control", phone: "1-800-222-1222", details: "National poison control hotline\nAvailable 24/7", color: 'red' },
];

const MainContent = () => {
  return (
    <>
      {/* ===== Featured Departments ===== */}
      <section id="departments" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4" data-aos="fade-up">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-700 mb-3">Featured Departments</h2>
          <p className="text-center text-gray-500 mb-12">
            Discover specialized departments dedicated to your complete care.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDepartments.map((dept, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay={i * 100}>
                <div className="relative">
                  <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    {dept.title} Image
                  </div>
                  <div className="absolute -bottom-6 left-6 bg-blue-600 text-white p-3 rounded-full shadow-lg">
                    {dept.icon}
                  </div>
                </div>
                <div className="p-6 pt-10">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{dept.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{dept.desc}</p>
                  <Link to={`/departments/${dept.title.toLowerCase()}`} className="text-blue-600 font-medium text-sm hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured Services ===== */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4" data-aos="fade-up">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-700 mb-3">Featured Services</h2>
          <p className="text-center text-gray-500 mb-12">Comprehensive healthcare solutions under one roof.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="bg-gray-50 rounded-xl border p-6 shadow-sm hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay={i * 100}>
                  <div className="flex items-start mb-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-700 text-lg mb-1">{service.title}</h4>
                      <p className="text-gray-600 text-sm">{service.desc}</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    {service.points.map((point, j) => (
                      <li key={j} className="flex items-center">
                        <BsCheckCircleFill className="text-green-500 mr-2" size={14} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link to="/services" className="text-blue-600 font-medium text-sm hover:underline">Learn More →</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Call To Action ===== */}
      <section id="cta" className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">Your Health is Our Priority</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We provide the best healthcare services with a compassionate touch. Book your appointment or meet our specialists today.
          </p>
        </div>
      </section>

      {/* ===== Emergency Info ===== */}
      <section id="emergency-info" className="py-16 bg-white">
        <div className="container mx-auto px-4" data-aos="fade-up">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-700 mb-3">Emergency Info</h2>
          <p className="text-center text-gray-500 mb-12">
            Immediate access to critical care and support whenever you need it.
          </p>

          <div className="bg-blue-600 text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between mb-10 shadow-lg">
            <div className="flex items-center mb-4 md:mb-0">
              <BsTelephoneFill className="text-3xl mr-4" />
              <div>
                <h5 className="font-bold text-lg">Medical Emergency?</h5>
                <p className="text-sm opacity-90">Call our 24/7 emergency hotline for immediate assistance.</p>
              </div>
            </div>
            <a href="tel:5551234567" className="bg-white text-blue-700 px-6 py-3 font-semibold rounded-full shadow hover:bg-gray-100 transition">
              <BsTelephoneFill className="inline mr-2" /> Call (555) 123-4567
            </a>
          </div>

          {/* Emergency Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {emergencyContacts.map((contact, i) => (
              <div key={i} className={`rounded-xl shadow-md p-6 border-l-4 ${contact.color === 'red' ? 'border-red-500' : 'border-blue-500'} bg-gray-50 text-center`}>
                <div className={`text-${contact.color}-500 text-4xl mb-3`}>
                  <FaAmbulance className="mx-auto" />
                </div>
                <h5 className="font-semibold text-gray-800 mb-1">{contact.title}</h5>
                <p className="text-blue-600 font-bold">{contact.phone}</p>
                <p className="text-gray-600 text-sm whitespace-pre-line mb-4">{contact.details}</p>
                <a href={`tel:${contact.phone}`} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Call Now</a>
              </div>
            ))}
          </div>

          <div className="bg-red-100 border border-red-400 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="flex items-center mb-3 md:mb-0">
              <FaAmbulance className="text-red-500 text-3xl mr-3" />
              <div>
                <h4 className="font-bold text-red-600 text-lg">Medical Emergency?</h4>
                <p className="text-gray-700 text-sm">
                  If you are experiencing a <strong>life-threatening emergency</strong>, call <strong>911</strong> immediately or go to your nearest emergency room.
                </p>
              </div>
            </div>
            <a href="tel:911" className="bg-red-600 text-white px-6 py-3 font-semibold rounded-lg shadow hover:bg-red-700 transition">
              <BsTelephoneFill className="inline mr-2" /> Call 911
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainContent;
