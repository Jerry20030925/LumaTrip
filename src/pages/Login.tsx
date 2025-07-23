import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, TextInput, Stack, Text, Alert, Box, PasswordInput } from '@mantine/core';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import AuthLayout from '../components/layout/AuthLayout';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 获取从ProtectedRoute传递的重定向路径
  const from = location.state?.from?.pathname || '/app/home';

  // 如果已经登录，重定向到目标页面
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('description');
    
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_failed':
        case 'oauth_session_error':
          setError('Google登录失败，请重试');
          break;
        case 'no_session':
        case 'no_session_after_retries':
          setError('登录会话无效，请重新登录');
          break;
        case 'callback_failed':
        case 'callback_processing_failed':
          setError('登录回调处理失败，请重试');
          break;
        case 'retry_session_error':
        case 'retry_exception':
          setError('会话重试失败，请重新登录');
          break;
        case 'access_denied':
          setError('您拒绝了授权，无法完成登录');
          break;
        default:
          setError(errorDescription ? `登录失败: ${decodeURIComponent(errorDescription)}` : '登录出现问题，请重试');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // 登录成功后重定向到目标页面
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');

    try {
      await loginWithGoogle();
      // OAuth redirect will handle navigation
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  };

  return (
    <AuthLayout
      title={t('welcome')}
      subtitle={t('sign_in')}
    >
      <Stack gap="lg">
        <GoogleLoginButton onLogin={handleGoogleLogin} />
        
        <Box style={{ textAlign: 'center' }}>
          <Text size="sm" c="dimmed">{t('or')}</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              radius="md"
              size="md"
            />

            <PasswordInput
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              radius="md"
              size="md"
              visibilityToggleIcon={({ reveal }) =>
                reveal ? <EyeOff size={18} /> : <Eye size={18} />
              }
            />

            {error && (
              <Alert color="red" radius="md">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              loading={loading}
              size="md"
              radius="md"
              gradient={{ from: 'blue', to: 'purple' }}
              fullWidth
            >
              {loading ? t('loading') : t('sign_in')}
            </Button>
          </Stack>
        </form>

        <Box style={{ textAlign: 'center' }}>
          <Text size="sm">
            {t('dont_have_account')}{' '}
            <Text component={Link} to="/app/register" c="blue" fw={500}>
              {t('sign_up')}
            </Text>
          </Text>
        </Box>
      </Stack>
    </AuthLayout>
  );
};

export default Login;