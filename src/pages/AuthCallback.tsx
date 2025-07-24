import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import useAuthStore from '../stores/authStore';
import LoadingSpinner from '../components/layout/LoadingSpinner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // 调试信息
        addDebugInfo(`Auth callback URL: ${window.location.href}`);
        addDebugInfo(`Hash: ${window.location.hash}`);
        addDebugInfo(`Search: ${window.location.search}`);
        
        // 检查URL中的错误参数
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
        if (error) {
          addDebugInfo(`OAuth error in URL: ${error} - ${errorDescription}`);
          navigate(`/login?error=${error}&description=${encodeURIComponent(errorDescription || '')}`);
          return;
        }
        
        // 立即检查当前会话
        addDebugInfo('Checking current session...');
        const { data: initialSession, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addDebugInfo(`Session error: ${sessionError.message}`);
          navigate('/login?error=oauth_session_error');
          return;
        }

        if (initialSession.session && initialSession.session.user) {
          addDebugInfo(`Found valid session for: ${initialSession.session.user.email}`);
          
          // 强制设置全局认证状态
          setSession(initialSession.session);
          
          // 清除任何可能的重定向状态
          localStorage.removeItem('lumatrip-redirect');
          
          // 等待一小段时间确保状态更新
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // 使用 window.location.replace 强制跳转，不留历史记录
          addDebugInfo('Force redirecting to /app/home using window.location.replace...');
          window.location.replace('/app/home');
          return;
        }

        // 如果没有立即找到会话，等待并重试
        addDebugInfo('No immediate session found, waiting for auth state change...');
        
        let retryCount = 0;
        const maxRetries = 5;
        const retryInterval = 1000; // 1秒
        
        const retrySessionCheck = async () => {
          try {
            retryCount++;
            addDebugInfo(`Retry ${retryCount}/${maxRetries}: Checking session...`);
            
            const { data: sessionData, error: retryError } = await supabase.auth.getSession();
            
            if (retryError) {
              addDebugInfo(`Retry error: ${retryError.message}`);
              if (retryCount >= maxRetries) {
                navigate('/login?error=retry_session_error');
                return;
              }
            }
            
            if (sessionData.session && sessionData.session.user) {
              addDebugInfo(`Retry success: Found session for ${sessionData.session.user.email}`);
              
              // 强制设置全局状态
              setSession(sessionData.session);
              
              // 清除重定向状态
              localStorage.removeItem('lumatrip-redirect');
              
              // 等待状态更新
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // 使用 window.location.replace 确保完全重新加载页面，不回到着陆页
              addDebugInfo('Redirecting to /app/home via window.location.replace...');
              window.location.replace('/app/home');
              return;
            }
            
            if (retryCount < maxRetries) {
              addDebugInfo(`No session yet, retrying in ${retryInterval}ms...`);
              setTimeout(retrySessionCheck, retryInterval);
            } else {
              addDebugInfo('Max retries reached, redirecting to login');
              navigate('/login?error=no_session_after_retries');
            }
          } catch (retryError: any) {
            addDebugInfo(`Retry exception: ${retryError.message}`);
            if (retryCount >= maxRetries) {
              navigate('/login?error=retry_exception');
            } else {
              setTimeout(retrySessionCheck, retryInterval);
            }
          }
        };
        
        // 开始重试逻辑
        setTimeout(retrySessionCheck, 500);
        
      } catch (error: any) {
        addDebugInfo(`Auth callback processing error: ${error.message}`);
        navigate('/login?error=callback_processing_failed');
      } finally {
        setTimeout(() => setIsProcessing(false), 10000); // 10秒后停止处理状态
      }
    };

    handleAuthCallback();
  }, [navigate, setSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto p-6">
        <LoadingSpinner message="正在处理 Google 登录..." />
        <p className="mt-4 text-gray-600">请稍候，我们正在完成您的登录</p>
        
        {/* 调试信息 (仅在开发环境显示) */}
        {import.meta.env.DEV && debugInfo.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">调试信息:</h3>
            <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </div>
        )}
        
        {!isProcessing && (
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-3">如果页面长时间无响应，请尝试以下操作：</p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.replace('/app/home')}
                className="block w-full px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50"
              >
                直接进入应用
              </button>
              <button 
                onClick={() => window.location.replace('/login')}
                className="block w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
              >
                返回登录页面
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;