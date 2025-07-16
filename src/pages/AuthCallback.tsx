import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import useAuthStore from '../stores/authStore';
import LoadingSpinner from '../components/layout/LoadingSpinner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // 调试信息
        console.log('Auth callback URL:', window.location.href);
        console.log('Auth callback hash:', window.location.hash);
        console.log('Auth callback search:', window.location.search);
        
        // 等待一下让URL参数完全加载
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 首先尝试从URL解析令牌
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        
        if (error) {
          console.error('OAuth error in URL:', error);
          navigate(`/login?error=${error}`);
          return;
        }
        
        if (accessToken) {
          console.log('Found access token in URL');
          // 等待Supabase处理令牌
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 处理OAuth回调 - 使用getSession
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('OAuth callback error:', sessionError);
          navigate('/login?error=oauth_failed');
          return;
        }

        if (data.session) {
          console.log('OAuth callback success:', data.session.user.email);
          // 设置认证状态
          setSession(data.session);
          // 短暂延迟确保状态更新
          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 200);
        } else {
          console.log('No session found, access token:', !!accessToken);
          
          if (accessToken) {
            // 如果有access_token但没有会话，再次尝试
            let retryCount = 0;
            const maxRetries = 3;
            
            const retrySession = async () => {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session) {
                setSession(sessionData.session);
                navigate('/home', { replace: true });
              } else if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retry ${retryCount} to get session`);
                setTimeout(retrySession, 1000);
              } else {
                navigate('/login?error=no_session');
              }
            };
            
            setTimeout(retrySession, 1000);
          } else {
            navigate('/login?error=no_session');
          }
        }
      } catch (error) {
        console.error('Auth callback processing error:', error);
        navigate('/login?error=callback_failed');
      } finally {
        setTimeout(() => setIsProcessing(false), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, setSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <LoadingSpinner message="正在处理登录..." />
        <p className="mt-4 text-gray-600">请稍候，我们正在完成您的登录</p>
        {!isProcessing && (
          <div className="mt-4 text-sm text-gray-500">
            <p>如果页面长时间无响应，请尝试刷新页面</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              返回登录页面
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;