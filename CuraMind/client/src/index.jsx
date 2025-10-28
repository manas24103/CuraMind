import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import 'swiper/css';
import 'glightbox/dist/css/glightbox.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './assets/css/main.css';
import App from './App';
import { ToastContainer } from 'react-toastify';

// Initialize AOS
import AOS from 'aos';
AOS.init({
  duration: 1000,
  once: true
});

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <App />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  </QueryClientProvider>
);
