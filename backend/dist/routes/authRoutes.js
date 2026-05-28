"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
// Initialize the Express Router for auth operations
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (with limit of 2 admins)
 * @access  Public
 */
router.post('/signup', authController_1.signup);
/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and return JWT
 * @access  Public
 */
router.post('/login', authController_1.login);
/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated session user profile
 * @access  Private (Requires valid JWT)
 */
router.get('/me', authMiddleware_1.authenticateToken, authController_1.getMe);
exports.default = router;
