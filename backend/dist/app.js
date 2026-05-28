"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Load configuration variables from .env file into process.env
dotenv_1.default.config();
// Create Express application instance
const app = (0, express_1.default)();
// Set the port configuration (defaults to 5000 if not specified)
const PORT = process.env.PORT || 5000;
// Enable Cross-Origin Resource Sharing (CORS) so frontend React client can fetch resources
app.use((0, cors_1.default)({
    origin: '*', // For development, allow any origin. In production, tighten this to your frontend domain.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Express middleware to parse incoming requests with JSON payloads
app.use(express_1.default.json());
/**
 * Health check route to verify that the API is up and running.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        service: 'Pharmacy Store Management System Backend'
    });
});
// Mount user authentication routes
app.use('/api/auth', authRoutes_1.default);
/**
 * Global centralized error-handling middleware.
 * Captures any unhandled route execution exceptions and returns a clean 500 response.
 */
app.use((err, req, res, next) => {
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
exports.default = app;
