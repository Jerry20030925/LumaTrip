import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import '../components/auth/Auth.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_failed':
          setError('Google登录失败，请重试');
          break;
        case 'no_session':
          setError('登录会话无效，请重新登录');
          break;
        case 'callback_failed':
          setError('登录处理失败，请重试');
          break;
        default:
          setError('登录出现问题，请重试');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/home');
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
    <div className="auth-container">
      <div className="auth-particles"></div>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('welcome')}</h1>
          <p className="auth-subtitle">{t('sign_in')}</p>
        </div>

        <div className="auth-form">
          <GoogleLoginButton onLogin={handleGoogleLogin} />
          
          <div className="auth-divider">
            <span>{t('or')}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? t('loading') : t('sign_in')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('dont_have_account')}{' '}
              <Link to="/register" className="auth-link">
                {t('sign_up')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;