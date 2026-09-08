import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../api/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (allowedRoles && allowedRoles.includes('ADMIN') && allowedRoles.length === 1) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on user's actual role
    if (user.role === 'OWNER') {
      return <Navigate to="/dashboard/owner" replace />;
    } else if (user.role === 'STAFF') {
      return <Navigate to="/dashboard/staff" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
