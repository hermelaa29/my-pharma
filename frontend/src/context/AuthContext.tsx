import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the role structure
export type Role = 'ADMIN' | 'COWORKER';

// User object structure
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

// Authentication Context values interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<boolean>;
  signup: (payload: any) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Create the context container with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to consume the AuthContext safely.
 * Throws an error if used outside an AuthProvider wrapper.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication Provider component.
 * Manages global authentication states, makes active API requests to the Express server, 
 * and handles persistent token caching inside localStorage.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any existing active session error messages
  const clearError = () => setError(null);

  // Initialize and check for existing session on page load/mount
  useEffect(() => {
    async function checkSession() {
      const activeToken = localStorage.getItem('token');
      if (!activeToken) {
        setLoading(false);
        return;
      }

      try {
        // Query /api/auth/me to confirm token validity and fetch fresh profile data
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(activeToken);
        } else {
          // If token is invalid or expired, clear active cached values
          logout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        // Do not force log out on simple network failure, but stop loading spinner
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  /**
   * Log in an existing user with email and password credentials.
   * Calls the backend auth service and persists the token on success.
   */
  const login = async (credentials: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // If error array (Zod validation) is returned, merge it, otherwise fetch text
        const errMsg = data.errors ? data.errors.join(', ') : (data.error || 'Login failed.');
        setError(errMsg);
        setLoading(false);
        return false;
      }

      // Persist values on successful response
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (err) {
      setError('Connection error. Please check if the backend server is running.');
      setLoading(false);
      return false;
    }
  };

  /**
   * Sign up a new user (with role restriction validation of 2 admins max).
   * Calls the backend signup endpoint.
   */
  const signup = async (payload: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data.errors ? data.errors.join(', ') : (data.error || 'Signup failed.');
        setError(errMsg);
        setLoading(false);
        return false;
      }

      // Automatically log in the user on successful signup
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (err) {
      setError('Connection error. Please check if the backend server is running.');
      setLoading(false);
      return false;
    }
  };

  /**
   * Log out the user by wiping local storage caching and clearing session states.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
