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
        
        // 检查URL中的错误参数
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
        if (error) {
          console.error('OAuth error in URL:', error, errorDescription);
          navigate(`/app/login?error=${error}&description=${encodeURIComponent(errorDescription || '')}`);
          return;
        }
        
        // 等待Supabase处理OAuth回调
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 获取当前会话
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('OAuth callback error:', sessionError);
          navigate('/app/login?error=oauth_session_error');
          return;
        }

        if (data.session && data.session.user) {
          console.log('OAuth callback success:', data.session.user.email);
          // 设置认证状态
          setSession(data.session);
          
          // 确保状态更新后再导航
          setTimeout(() => {
            navigate('/app/home', { replace: true });
          }, 500);
        } else {
          console.log('No session found after OAuth callback');
          
          // 尝试重新获取会话
          let retryCount = 0;
          const maxRetries = 3;
          
          const retrySession = async () => {
            try {
              const { data: sessionData, error: retryError } = await supabase.auth.getSession();
              
              if (retryError) {
                console.error('Retry session error:', retryError);
                navigate('/app/login?error=retry_session_error');
                return;
              }
              
              if (sessionData.session && sessionData.session.user) {
                console.log('Retry success:', sessionData.session.user.email);
                setSession(sessionData.session);
                navigate('/app/home', { replace: true });
              } else if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retry ${retryCount}/${maxRetries} to get session`);
                setTimeout(retrySession, 2000);
              } else {
                console.error('Failed to get session after retries');
                navigate('/app/login?error=no_session_after_retries');
              }
            } catch (retryError) {
              console.error('Retry session exception:', retryError);
              navigate('/app/login?error=retry_exception');
            }
          };
          
          setTimeout(retrySession, 1500);
        }
      } catch (error) {
        console.error('Auth callback processing error:', error);
        navigate('/app/login?error=callback_processing_failed');
      } finally {
        setTimeout(() => setIsProcessing(false), 3000);
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