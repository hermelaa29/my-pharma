import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { signupSchema, loginSchema } from '../utils/validation';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Handle new user registration (Signup).
 * Enforces strong input validation, ensures unique emails, 
 * and strictly limits the maximum number of registered Admins to 2.
 */
export async function signup(req: Request, res: Response) {
  try {
    // 1. Validate payload inputs against the strict Zod schema
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
      // Map and return detailed formatting validation errors
      const errors = parsedData.error.errors.map(err => err.message);
      return res.status(400).json({ errors });
    }

    const { name, email, password, role } = parsedData.data;

    // 2. Query DB to ensure email is unique
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    // 3. ENFORCE ADMIN LIMIT CONSTRAINT
    // If user is signing up as an ADMIN, we check the current count of existing ADMINs in the system.
    if (role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      // Strict validation: if there are already 2 Admin users, block this signup action.
      if (adminCount >= 2) {
        return res.status(400).json({
          error: 'Maximum number of Admin users (2) has already been reached. Only Coworker registration is currently allowed.'
        });
      }
    }

    // 4. Hash the raw user password using bcryptjs for secure storage
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Create new User entry in the PostgreSQL database using Prisma ORM
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 6. Generate a JSON Web Token (JWT) valid for 24 hours
    const jwtSecret = process.env.JWT_SECRET || 'pharmacy_jwt_secret_key_2026_smooth_colors_shadcn_ui_prisma';
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // 7. Send back success response containing newly created user profile and JWT
    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Error during Signup processing:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

/**
 * Handle user credentials authentication (Login).
 * Verifies email/password records and returns a signed JWT token on success.
 */
export async function login(req: Request, res: Response) {
  try {
    // 1. Validate payload inputs against the Login Zod schema
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      const errors = parsedData.error.errors.map(err => err.message);
      return res.status(400).json({ errors });
    }

    const { email, password } = parsedData.data;

    // 2. Check if the user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Verify password hash matching
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate JSON Web Token (JWT)
    const jwtSecret = process.env.JWT_SECRET || 'pharmacy_jwt_secret_key_2026_smooth_colors_shadcn_ui_prisma';
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // 5. Send back user details (excluding password) and auth token
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error during Login processing:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

/**
 * Retrieve credentials of the currently logged-in user (Me).
 * Uses the authRequest context populated by authenticateToken middleware.
 */
export async function getMe(req: AuthRequest, res: Response) {
  try {
    // Check if the user object exists in the request context
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    // Return the active user details
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Error retrieving active session user profile:', error);
    return res.status(500).json({ error: 'Internal server error retrieving user details.' });
  }
}
