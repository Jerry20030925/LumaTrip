import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import '../components/auth/Auth.css';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwords_do_not_match'));
      setLoading(false);
      return;
    }

    try {
      await register(email, password);
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
          <p className="auth-subtitle">{t('sign_up')}</p>
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

            <div className="form-group">
              <input
                type="password"
                placeholder={t('confirm_password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? t('loading') : t('sign_up')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('already_have_account')}{' '}
              <Link to="/login" className="auth-link">
                {t('sign_in')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;