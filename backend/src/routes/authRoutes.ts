import { Router } from 'express';
import { signup, login, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

// Initialize the Express Router for auth operations
const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (with limit of 2 admins)
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and return JWT
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated session user profile
 * @access  Private (Requires valid JWT)
 */
router.get('/me', authenticateToken, getMe);

export default router;
