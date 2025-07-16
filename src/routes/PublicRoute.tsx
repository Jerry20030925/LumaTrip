import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { useState, useEffect } from 'react';

const PublicRoute = () => {
  const { session, isLoading } = useAuth();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowError(true);
      }
    }, 10000); // 10秒超时

    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !showError) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (showError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h2>加载超时</h2>
        <p>认证初始化超时，请检查网络连接或刷新页面重试。</p>
        <p>您可以访问 <a href="/debug" style={{ color: 'yellow' }}>调试页面</a> 查看详细信息。</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: 'white', color: '#667eea', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          刷新页面
        </button>
      </div>
    );
  }

  // 如果已经登录，重定向到首页
  if (session) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;