import { RouterProvider } from 'react-router-dom';
import { useEffect, useState } from 'react';
import router from './routes';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';
import LoadingSpinner from './components/layout/LoadingSpinner';
import PerformanceMonitor from './components/ui/PerformanceMonitor';
import SEOHead from './components/ui/SEOHead';
import { supabase } from './utils/supabaseClient';
import { authDebugger } from './utils/authDebugger';
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
        
        // 记录初始化开始
        if (import.meta.env.DEV) {
          console.log('🚀 开始认证初始化...');
          await authDebugger.logCurrentState();
        }
        
        // 首先检查持久化认证状态
        const persistentAuth = localStorage.getItem('lumatrip-persistent-auth');
        if (persistentAuth) {
          try {
            const authData = JSON.parse(persistentAuth);
            if (authData.user) {
              console.log('Found persistent auth, using cached user:', authData.user.email);
              setSession({ user: authData.user });
              
              if (mounted) {
                setIsInitialized(true);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.warn('Failed to parse persistent auth:', e);
            localStorage.removeItem('lumatrip-persistent-auth');
          }
        }
        
        // 检查localStorage中的 Zustand 认证状态
        const storedAuth = localStorage.getItem('lumatrip-auth');
        if (storedAuth) {
          const { state } = JSON.parse(storedAuth);
          if (state?.session?.access_token || state?.isAuthenticated) {
            console.log('Found stored session, validating...');
            
            // 验证存储的session是否仍然有效
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (session && !error) {
              console.log('Stored session is valid');
              setSession(session);
            } else {
              console.log('Stored session is invalid, but keeping user logged in with cached data');
              // 即使 Supabase session 无效，也保持用户登录状态
              if (state?.user) {
                setSession({ user: state.user });
              }
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
          
          // 记录初始化完成状态
          if (import.meta.env.DEV) {
            console.log('✅ 认证初始化完成');
            await authDebugger.logCurrentState();
          }
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          // 即使出错，也尝试从持久化存储恢复用户状态
          const persistentAuth = localStorage.getItem('lumatrip-persistent-auth');
          if (persistentAuth) {
            try {
              const authData = JSON.parse(persistentAuth);
              if (authData.user) {
                console.log('Recovering from persistent auth after error');
                setSession({ user: authData.user });
              }
            } catch (e) {
              console.warn('Failed to recover from persistent auth');
            }
          }
          
          setIsInitialized(true);
          setLoading(false);
          
          // 记录错误状态
          if (import.meta.env.DEV) {
            console.log('❌ 认证初始化失败');
            await authDebugger.logCurrentState();
          }
        }
      }
    };

    // 设置超时保护
    const timeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.warn('Auth initialization timeout');
        
        // 超时时也尝试从持久化存储恢复
        const persistentAuth = localStorage.getItem('lumatrip-persistent-auth');
        if (persistentAuth) {
          try {
            const authData = JSON.parse(persistentAuth);
            if (authData.user) {
              console.log('Timeout recovery from persistent auth');
              setSession({ user: authData.user });
            }
          } catch (e) {
            console.warn('Failed timeout recovery');
          }
        }
        
        setIsInitialized(true);
        setLoading(false);
        
        // 记录超时状态
        if (import.meta.env.DEV) {
          console.log('⏰ 认证初始化超时');
          authDebugger.logCurrentState();
        }
      }
    }, 5000);

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [setSession, setLoading]);

  // 移除自动 session 检查，避免用户被意外登出
  // 注释掉定期检查，让用户可以持续使用应用
  /*
  useEffect(() => {
    if (!isAuthenticated || !session) return;
    
    const checkSession = async () => {
      try {
        // 使用 sessionMonitor 进行更智能的检查
        const status = await sessionMonitor.checkSessionStatus();
        
        if (!status.isValid) {
          console.log('Session invalid, logging out...', status.details);
          
          // 记录登出原因
          if (import.meta.env.DEV) {
            console.log('🔄 Session 失效，即将登出');
            await authDebugger.diagnoseLoginRedirect();
          }
          
          setSession(null);
        } else if (status.timeUntilExpiry && status.timeUntilExpiry < 5 * 60) {
          // 如果5分钟内即将过期，尝试刷新
          console.log('Session expiring soon, attempting refresh...');
          try {
            const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
            if (refreshedSession && !error) {
              console.log('Session refreshed successfully');
              setSession(refreshedSession);
              
              if (import.meta.env.DEV) {
                console.log('🔄 Session 刷新成功');
                await authDebugger.logCurrentState();
              }
            }
          } catch (refreshError) {
            console.error('Session refresh failed:', refreshError);
            
            if (import.meta.env.DEV) {
              console.log('❌ Session 刷新失败');
              await authDebugger.logCurrentState();
            }
          }
        }
        
        // 在开发环境下定期打印 session 状态
        if (import.meta.env.DEV) {
          await sessionMonitor.logSessionInfo();
        }
      } catch (error) {
        console.error('Session check exception:', error);
        // 网络错误等异常情况不立即登出，给用户更多容错时间
        
        if (import.meta.env.DEV) {
          console.log('❌ Session 检查异常');
          await authDebugger.logCurrentState();
        }
      }
    };
    
    // 大幅延长检查间隔到60分钟，减少频繁检查
    const interval = setInterval(checkSession, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, session, setSession]);
  */

  // 监听认证状态变化并记录调试信息
  useEffect(() => {
    if (import.meta.env.DEV) {
      const logAuthStateChange = async () => {
        console.log('🔄 认证状态发生变化');
        await authDebugger.logCurrentState();
      };
      
      logAuthStateChange();
    }
  }, [isAuthenticated, session]);

  if (!isInitialized) {
    return <LoadingSpinner message="初始化中..." />;
  }

  return (
    <ThemeProvider>
      <EnhancedErrorBoundary 
        onError={(error, errorInfo) => {
          // 可以在这里添加额外的错误处理逻辑
          console.error('Global error caught:', error, errorInfo);
          
          // 记录错误发生时的认证状态
          if (import.meta.env.DEV) {
            authDebugger.logCurrentState();
          }
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
