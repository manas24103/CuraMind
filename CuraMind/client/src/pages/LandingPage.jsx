import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import MainContent from '../components/MainContent';
import { FaPhoneAlt, FaClock, FaHeartbeat, FaLungs } from 'react-icons/fa';

// Local hero background image
const HeroBackground = 'images/hero-bg.jpg';

const LandingPage = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Data for the service/info cards at the bottom of the hero
  const infoBoxes = [
    { title: "Emergency Line", content: "+1 (555) 987-6543", isPhone: true, icon: <FaPhoneAlt className="mx-auto text-cyan-500 text-3xl mb-3" /> }, // Use a cyan color for the info icons
    { title: "Working Hours", content: "Mon - Fri: 8AM - 8PM", isPhone: false, icon: <FaClock className="mx-auto text-cyan-500 text-3xl mb-3" /> },
    { title: "Cardiology", content: "Expert heart care for all your cardiovascular needs.", isPhone: false, icon: <FaHeartbeat className="mx-auto text-cyan-500 text-3xl mb-3" /> },
    { title: "Pulmonology", content: "Comprehensive lung and respiratory care services.", isPhone: false, icon: <FaLungs className="mx-auto text-cyan-500 text-3xl mb-3" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* The <Header /> and <Footer /> must be rendered by the Layout component in App.js */}
      
      {/* ======= Hero Section (With Background Image) ======= */}
      <section 
        id="hero" 
        className="relative min-h-screen flex items-center pt-24 pb-40 md:pt-32 md:pb-48"
        // Key Fix: Add mt-[-80px] class (or similar) here if the Header is fixed and this section needs to be pulled up
        // NOTE: Tailwind does not support arbitrary negative margin classes directly unless configured.
        // It's safer to use padding-top on this section and adjust the min-h-screen for fixed header offset.
        // Assuming a standard fixed header height of ~80px:
        style={{ marginTop: '-80px' }} 
      > 
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${HeroBackground})`,
          }}
        ></div>

        {/* Main Content Wrapper (Center Content Vertically & Horizontally) */}
        <div className="container mx-auto px-4 relative z-10 w-full">
            <div className='flex items-center min-h-[calc(100vh-160px)]'> {/* Removed justify-center to align text to left */}
                <div className="max-w-4xl text-white pt-20 pl-8" data-aos="fade-up"> {/* Added pl-8 for left padding */}
                    {/* Leading Specialist Badge */}
                    <div className="inline-block bg-cyan-500/20 text-cyan-300 text-sm font-medium px-4 py-2 rounded-full mb-6" 
                            data-aos="fade-up">
                        Leading Healthcare Specialists
                    </div>
                    
                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" 
                            data-aos="fade-up" 
                            data-aos-delay="100">
                        Advanced Medical Care for Your Family's Health
                    </h1>
                    
                    {/* Subtitle/Description */}
                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl" 
                        data-aos="fade-up" 
                        data-aos-delay="200">
                        Exceptional healthcare services with a focus on patient well-being and cutting-edge medical technology.
                    </p>

                    {/* Removed CTA Buttons as per request */}
                </div>
            </div>
            
            {/* Info Boxes/Service Cards at the very bottom */}
            {/* FIX: Simplified positioning. Tailwind's absolute positioning is tricky for full-width elements. */}
            {/* We will center the container but let the cards overlap into the next section */}
            <div className="absolute bottom-[-60px] left-0 right-0 z-20 px-4" 
                    data-aos="fade-up" 
                    data-aos-delay="500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
                    {infoBoxes.map((box, i) => (
                        <div 
                            key={i}
                            className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                        >
                            {/* Icon */}
                            {box.icon}
                            
                            <h5 className="text-lg font-semibold text-gray-800 mb-2">{box.title}</h5>
                            
                            {box.isPhone ? (
                                <a 
                                    href={`tel:${box.content}`} 
                                    className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                                >
                                    {box.content}
                                </a>
                            ) : (
                                <p className="text-gray-600 text-sm">{box.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>
      
       {/* Main Content Sections - Adjusted padding to reduce space */}
      <div className="pt-20"> {/* Reduced padding from pt-32 to pt-20 */}
            <MainContent />
      </div>
    </div>
  );
};

export default LandingPage;