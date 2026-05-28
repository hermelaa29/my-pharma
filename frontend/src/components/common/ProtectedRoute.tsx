import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Role } from '../../context/AuthContext';

// Protected Route configuration options
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * Route protection wrapper.
 * Intercepts routing calls, confirms user session, and renders role-based locks.
 * Displays a premium loading spinner while the session validity is verified.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. If global session verification is still running, show a premium smooth green spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#51a22e]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#51a22e] animate-spin"></div>
          </div>
          <p className="text-[#51a22e] font-medium tracking-wide animate-pulse">
            Verifying secure credentials...
          </p>
        </div>
      </div>
    );
  }

  // 2. If the user is unauthenticated, redirect to Login and store the current page to navigate back
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If specific roles are required and user role is not allowed, redirect to store selection
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/stores" replace />;
  }

  // 4. Return children if all validation guards pass successfully
  return <>{children}</>;
};

export default ProtectedRoute;
