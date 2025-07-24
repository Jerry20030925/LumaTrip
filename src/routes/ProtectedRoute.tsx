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

  // 检查持久化存储中的认证状态
  const checkPersistentAuth = () => {
    try {
      const persistentAuth = localStorage.getItem('lumatrip-persistent-auth');
      if (persistentAuth) {
        const authData = JSON.parse(persistentAuth);
        return !!(authData.user);
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // 检查 Zustand 持久化存储
  const checkZustandAuth = () => {
    try {
      const zustandAuth = localStorage.getItem('lumatrip-auth');
      if (zustandAuth) {
        const authData = JSON.parse(zustandAuth);
        return !!(authData.state?.isAuthenticated);
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // 多重认证检查 - 任何一个通过就允许访问
  const isUserAuthenticated = isAuthenticated || 
                              checkPersistentAuth() || 
                              checkZustandAuth() ||
                              (session && session.user);

  if (!isUserAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    // 保存当前路径以便登录后跳转回来
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  // 在开发环境下显示认证状态信息
  if (import.meta.env.DEV) {
    console.info('Auth status:', {
      isAuthenticated,
      hasPersistentAuth: checkPersistentAuth(),
      hasZustandAuth: checkZustandAuth(),
      hasSession: !!(session?.user),
      finalDecision: isUserAuthenticated
    });
  }

  return <Outlet />;
};

export default ProtectedRoute;