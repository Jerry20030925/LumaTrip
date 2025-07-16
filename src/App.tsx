import { RouterProvider } from 'react-router-dom';
import { useEffect, useState } from 'react';
import router from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/layout/LoadingSpinner';
import { supabase } from './utils/supabaseClient';
import useAuthStore from './stores/authStore';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setSession } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // 添加更短的超时时间来快速检测网络问题
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 3000);
        });
        
        // 直接获取当前会话
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (mounted) {
          setSession(session);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setIsInitialized(true);
        }
      }
    };

    // 设置超时保护 - 减少到2秒以提供更好的用户体验
    const timeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.warn('Auth initialization timeout');
        setSession(null);
        setIsInitialized(true);
      }
    }, 2000);

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [setSession]);

  if (!isInitialized) {
    return <LoadingSpinner message="初始化中..." />;
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
