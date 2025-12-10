import cors from 'cors';

const setupCors = (app) => {
  // Allowed origins - add your production URL here
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
    'https://cura-mind-nine.vercel.app',
    'https://cura-rust.onrender.com',
    'https://cura-mind.vercel.app'
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.warn('CORS: No origin header present');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        return callback(null, true);
      } else {
        console.warn(`CORS: Blocked request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-Auth-Token',
      'X-CSRF-Token',
      'X-Forwarded-For',
      'X-Forwarded-Host'
    ],
    exposedHeaders: [
      'Content-Length',
      'X-Foo',
      'X-Bar',
      'Set-Cookie',
      'Authorization'
    ],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  };

  // Apply CORS to all routes
  app.use(cors(corsOptions));
  
  // Handle preflight requests
  app.options('*', cors(corsOptions));
  
  // Log CORS headers for debugging
  app.use((req, res, next) => {
    console.log('CORS Headers:', {
      origin: req.headers.origin,
      method: req.method,
      'access-control-request-headers': req.headers['access-control-request-headers'],
      'access-control-request-method': req.headers['access-control-request-method']
    });
    next();
  });
};

export { setupCors };

export default setupCors;
