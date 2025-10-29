import React from 'react';
import { FaHeartbeat, FaUserMd, FaHospital, FaAward, FaUsers, FaArrowRight, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const stats = [
    { 
      number: '25+', 
      label: 'Years Experience', 
      icon: <FaAward className="text-primary-500 mx-auto" size={40} /> 
    },
    { 
      number: '100+', 
      label: 'Expert Doctors', 
      icon: <FaUserMd className="text-primary-500 mx-auto" size={40} /> 
    },
    { 
      number: '50+', 
      label: 'Medical Beds', 
      icon: <FaHospital className="text-primary-500 mx-auto" size={40} /> 
    },
    { 
      number: '50K+', 
      label: 'Happy Patients', 
      icon: <FaUsers className="text-primary-500 mx-auto" size={40} /> 
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      image: '/images/team/doctor1.jpg'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      role: 'Head of Cardiology',
      image: '/images/team/doctor2.jpg'
    },
    {
      id: 3,
      name: 'Dr. Emily Wilson',
      role: 'Pediatric Specialist',
      image: '/images/team/doctor3.jpg'
    },
    {
      id: 4,
      name: 'Dr. Robert Taylor',
      role: 'Neurology Expert',
      image: '/images/team/doctor4.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-primary-600 text-white py-20">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MediTrust Hospital</h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            Providing exceptional healthcare services with compassion and cutting-edge technology since 1998.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
              <img 
                src="/images/hospital-building.jpg" 
                alt="MediTrust Hospital" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6">
                Founded in 1998, MediTrust Hospital has grown from a small community clinic to a leading healthcare 
                institution serving patients from across the region. Our commitment to excellence in patient care 
                and medical innovation has been the cornerstone of our success.
              </p>
              <p className="text-gray-600 mb-8">
                Today, we continue to expand our services and facilities while maintaining the personal touch 
                that has defined our approach to healthcare for over two decades.
              </p>
              <Link 
                to="/about/more" 
                className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
              >
                Learn more about our history <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Expert Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team of dedicated healthcare professionals is committed to providing the highest quality care to our patients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 mb-4">{member.role}</p>
                  <div className="flex justify-center space-x-4">
                    <a href="#" className="text-gray-400 hover:text-primary-600">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-primary-600">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/doctors" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View All Doctors
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience exceptional healthcare?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Book an appointment with one of our specialists today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/appointment" 
              className="px-8 py-3 bg-white text-primary-700 font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              Book Appointment
            </Link>
            <a 
              href="tel:+1234567890" 
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <FaPhone className="mr-2" /> Call Us Now
            </a>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Our Location</h3>
              <p className="text-gray-600">123 Medical Drive, Health City, HC 12345</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPhone className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone Number</h3>
              <p className="text-gray-600">+1 (234) 567-8900</p>
              <p className="text-gray-600">+1 (234) 567-8901 (Emergency)</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Working Hours</h3>
              <p className="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p className="text-gray-600">Saturday: 9:00 AM - 5:00 PM</p>
              <p className="text-gray-600">Emergency: 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
