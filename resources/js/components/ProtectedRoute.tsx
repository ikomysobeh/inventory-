import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'employee';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  console.log('[ProtectedRoute]', { requiredRole, isLoading, isAuthenticated, role: user?.role });

  if (isLoading) {
    console.log('[ProtectedRoute] → showing spinner (isLoading=true)');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f1117' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #f97316', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] → redirect /login (not authenticated)');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log(`[ProtectedRoute] → redirect /inventory (need ${requiredRole}, have ${user?.role})`);
    return <Navigate to="/inventory" replace />;
  }

  console.log('[ProtectedRoute] → rendering children ✓');
  return <>{children}</>;
}
