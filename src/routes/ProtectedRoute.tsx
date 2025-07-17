import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/layout/LoadingSpinner';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  // 显示加载状态
  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  if (!session) {
    return <Navigate to="/app/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;