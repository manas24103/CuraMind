import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { v4 as uuid4 } from 'uuid';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import testRoutes from './routes/test.routes.js';
import adminRoutes from './routes/admin.routes.js';
import receptionistRoutes from './routes/receptionist.routes.js';
import errorHandler from './middleware/error.middleware.js';
import connectDB from './config/db.js';

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root .env file
const envPath = path.resolve(process.cwd(), '.env');

// Load environment variables
dotenv.config({ path: envPath });

// Set default NODE_ENV to 'development' if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Enable CORS pre-flight
app.options('*', cors(corsOptions));

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(204).send();
  }
  next();
});

// Request logging middleware (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('Body:', req.body);
    }
    next();
  });
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
import helmet from 'helmet';
import compression from 'compression';

app.use(helmet());
app.use(compression());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Default configuration
const config = {
  databaseUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meditrust',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Schedule cleanup for temporary patients
import cron from 'node-cron';
import Patient from './models/patient.js';

// Schedule cleanup every hour
cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Patient.deleteMany({
      createdAt: { $lt: cutoff },
      hasBookedAppointment: false
    });
    if (result.deletedCount > 0) {
      console.log(`🧹 Deleted ${result.deletedCount} expired temporary patients`);
    }
  } catch (error) {
    console.error('Error cleaning up temporary patients:', error);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  genid: () => uuid4(),
  store: MongoStore.create({
    mongoUrl: config.databaseUrl,
    mongoOptions: {},
    ttl: 24 * 60 * 60, // 24 hours
    touchAfter: 24 * 3600, // 24 hours
    autoRemove: 'native' // Remove expired sessions automatically
  })
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

// Debug: Log all registered routes
const printRoutes = (routes, parentPath = '') => {
  routes.forEach(route => {
    if (route.route) {
      // Routes registered directly on the app
      const methods = Object.keys(route.route.methods).join(',').toUpperCase();
      console.log(`${methods.padEnd(7)} ${parentPath}${route.route.path}`);
    } else if (route.name === 'router' && route.handle.stack) {
      // Router middleware
      const routerPath = route.regexp.toString()
        .replace('/^', '')
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '')
        .replace(/\/(?:([^\/]+?))\//g, '/:$1/');
      
      route.handle.stack.forEach(handler => {
        const methods = handler.route ? 
          Object.keys(handler.route.methods).join(',').toUpperCase() : 'ALL';
        const path = handler.route ? handler.route.path : '';
        console.log(`${methods.padEnd(7)} /api${parentPath}${routerPath}${path}`);
      });
    }
  });
};

// Routes
console.log('\n=== Registered Routes ===');
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);

// Print all routes after they're registered in development
if (process.env.NODE_ENV === 'development') {
  process.nextTick(() => {
    printRoutes(app._router.stack);
  });
}

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
    await connectDB(config.databaseUrl);
    const server = app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Server running on port ${PORT}`);
      }
    });

    // Graceful shutdown handler
    const shutdown = async () => {
      server.close(() => {
        process.exit(0);
      });

      // Force close server after 10 seconds
      setTimeout(() => {
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
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
