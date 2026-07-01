/**
 * Protected Route Components
 * Handles authentication and role-based access control
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/context/authStore';
import { PageSkeleton } from '@/components/loaders/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-[#060612]">
        <PageSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * AdminRoute - Requires admin role
 * Redirects to dashboard if not admin, login if not authenticated
 */
export function AdminRoute({ children, redirectTo = '/dashboard' }: AdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-[#060612]">
        <PageSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

/**
 * GuestRoute - Only for non-authenticated users
 * Redirects to dashboard if already authenticated
 */
export function GuestRoute({ children, redirectTo = '/dashboard' }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-[#060612]">
        <PageSkeleton />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to the page they came from or dashboard
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
