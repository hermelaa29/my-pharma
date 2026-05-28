import { z } from 'zod';

/**
 * Strong validation schema for User Signup.
 * Ensures data integrity and enforces security constraints such as password strength.
 */
export const signupSchema = z.object({
  // Name must be between 2 and 50 characters, trimmed of whitespace
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name cannot exceed 50 characters' })
    .trim(),

  // Email must be a valid email format, trimmed and lowercased
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .trim()
    .toLowerCase(),

  // Password must be a strong password with specific character requirements
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character (e.g., !, @, #, $, etc.)' }),

  // Role must be strictly ADMIN or COWORKER
  role: z.enum(['ADMIN', 'COWORKER'], {
    errorMap: () => ({ message: 'Role must be either ADMIN or COWORKER' }),
  }),
});

/**
 * Validation schema for User Login.
 * Standard Zod structure to parse and validate incoming credentials.
 */
export const loginSchema = z.object({
  // Ensure the email is formatted correctly
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .trim()
    .toLowerCase(),

  // Confirm password is provided (no need for regex checks during login)
  password: z.string()
    .min(1, { message: 'Password is required' }),
});
