import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/layout/LoadingSpinner';

const ProtectedRoute = () => {
  const { session, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 显示加载状态
  if (isLoading) {
    return <LoadingSpinner message="验证身份中..." />;
  }

  // 检查是否已认证
  if (!isAuthenticated || !session) {
    console.log('User not authenticated, redirecting to login');
    // 保存当前路径以便登录后跳转回来
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  // 验证session是否过期
  if (session.expires_at && Date.now() / 1000 > session.expires_at) {
    console.log('Session expired, redirecting to login');
    return <Navigate to="/app/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;