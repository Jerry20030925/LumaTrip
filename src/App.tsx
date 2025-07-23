import { RouterProvider } from 'react-router-dom';
import { useEffect, useState } from 'react';
import router from './routes';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';
import LoadingSpinner from './components/layout/LoadingSpinner';
import PerformanceMonitor from './components/ui/PerformanceMonitor';
import SEOHead from './components/ui/SEOHead';
import { supabase } from './utils/supabaseClient';
import useAuthStore from './stores/authStore';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setSession, setLoading, session, isAuthenticated } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // 首先检查localStorage中的认证状态
        const storedAuth = localStorage.getItem('lumatrip-auth');
        if (storedAuth) {
          const { state } = JSON.parse(storedAuth);
          if (state?.session?.access_token) {
            console.log('Found stored session, validating...');
            
            // 验证存储的session是否仍然有效
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (session && !error) {
              console.log('Stored session is valid');
              setSession(session);
            } else {
              console.log('Stored session is invalid, clearing...');
              localStorage.removeItem('lumatrip-auth');
              setSession(null);
            }
          }
        } else {
          // 没有存储的认证状态，检查Supabase会话
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
        }
        
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setIsInitialized(true);
          setLoading(false);
        }
      }
    };

    // 设置超时保护
    const timeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.warn('Auth initialization timeout');
        setSession(null);
        setIsInitialized(true);
        setLoading(false);
      }
    }, 5000);

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [setSession, setLoading]);

  // 添加session验证的定期检查
  useEffect(() => {
    if (!isAuthenticated || !session) return;
    
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log('Session expired, logging out...');
          setSession(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    // 每5分钟检查一次session状态
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, session, setSession]);

  if (!isInitialized) {
    return <LoadingSpinner message="初始化中..." />;
  }

  return (
    <ThemeProvider>
      <EnhancedErrorBoundary 
        onError={(error, errorInfo) => {
          // 可以在这里添加额外的错误处理逻辑
          console.error('Global error caught:', error, errorInfo);
        }}
      >
        {/* SEO 优化组件 */}
        <SEOHead />
        
        {/* 性能监控组件 */}
        <PerformanceMonitor />
        
        {/* 路由提供者 */}
        <RouterProvider router={router} />
      </EnhancedErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
