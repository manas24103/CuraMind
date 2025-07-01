import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import testRoutes from './routes/test.routes.js';
import  errorHandler  from './middleware/error.middleware.js';
import connectDB from './config/db.js';

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);

// Load environment variables
dotenv.config({ path: envPath });

// Set default NODE_ENV to 'development' if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Debug log loaded environment variables
console.log('Environment Variables:');
console.log('- PORT:', process.env.PORT );
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGO_URI:', process.env.MONGO_URI ? '***' : 'Not set');

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Default configuration
const config = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/doctor_dashboard',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  nodeEnv: process.env.NODE_ENV || 'development'
};

console.log('Using database URL:', config.databaseUrl);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  genid: () => uuidv4(),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Trust first proxy (if behind a reverse proxy like nginx)
app.set('trust proxy', 1);

// Simple request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Serve static files from the public directory
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
