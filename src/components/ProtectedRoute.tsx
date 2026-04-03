import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600" />
  </div>
);

interface ProtectedRouteProps {
  requiredRole?: 'organizer' | 'admin' | 'controller';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'controller' && user.role !== 'controller') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'organizer' && user.role !== 'organizer') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin') {
    const isAdmin = user.adminRole && !['user', 'organizer', 'controller'].includes(user.adminRole);
    if (!isAdmin) return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
