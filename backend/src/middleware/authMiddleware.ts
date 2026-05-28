import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

// Define a custom interface extending Express Request to hold the authenticated user data
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'COWORKER';
  };
}

/**
 * Middleware function to authenticate requests using JWT tokens.
 * Extracts the token, verifies it, fetches the user from PostgreSQL, and attaches user info to request.
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Get the Authorization header from incoming request
    const authHeader = req.headers['authorization'];
    
    // Authorization header format is expected to be: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 2. Retrieve JWT secret key from environment
    const jwtSecret = process.env.JWT_SECRET || 'pharmacy_jwt_secret_key_2026_smooth_colors_shadcn_ui_prisma';

    // 3. Verify the signature of the token
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };

    if (!decoded || !decoded.id) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    // 4. Look up user details in the PostgreSQL database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User associated with this token not found.' });
    }

    // 5. Attach the authenticated user object to the request for subsequent middlewares/controllers
    req.user = user;

    // 6. Transfer control to the next route handler
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    return res.status(403).json({ error: 'Failed to authenticate token.' });
  }
}
