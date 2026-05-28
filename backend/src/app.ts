import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import storeRoutes from './routes/storeRoutes';
import userRoutes from './routes/userRoutes';
import medicineRoutes from './routes/medicineRoutes';

// Load configuration variables from .env file into process.env
dotenv.config();

// Create Express application instance
const app = express();

// Set the port configuration (defaults to 5000 if not specified)
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) so frontend React client can fetch resources
app.use(cors({
  origin: '*', // For development, allow any origin. In production, tighten this to your frontend domain.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Express middleware to parse incoming requests with JSON payloads
app.use(express.json());

/**
 * Health check route to verify that the API is up and running.
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'Pharmacy Store Management System Backend'
  });
});

// Mount user authentication routes
app.use('/api/auth', authRoutes);

// Mount pharmacy store routes
app.use('/api/stores', storeRoutes);

// Mount user & coworker routes
app.use('/api/users', userRoutes);

// Mount medicine routes (nested under stores)
app.use('/api/stores', medicineRoutes);

/**
 * Global centralized error-handling middleware.
 * Captures any unhandled route execution exceptions and returns a clean 500 response.
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    error: 'An unexpected internal server error occurred.'
  });
});

/**
 * Start Express listening for connection requests.
 */
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Pharmacy Server is actively running on port ${PORT} `);
  console.log(` Mode: Development                                 `);
  console.log(` Health Check: http://localhost:${PORT}/health      `);
  console.log(`===================================================`);
});

export default app;
