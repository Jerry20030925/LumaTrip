import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import LocationOnboarding from '../components/location/LocationOnboarding';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLocationOnboarding, setShowLocationOnboarding] = useState(false);

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
      setShowLocationOnboarding(true);
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

  const handleLocationOnboardingComplete = () => {
    setShowLocationOnboarding(false);
    navigate('/app/home');
  };

  const handleLocationOnboardingSkip = () => {
    setShowLocationOnboarding(false);
    navigate('/app/home');
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

            <div className="form-group password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="form-group password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirm_password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
              <Link to="/app/login" className="auth-link">
                {t('sign_in')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Location Onboarding Modal */}
      <LocationOnboarding
        isOpen={showLocationOnboarding}
        onComplete={handleLocationOnboardingComplete}
        onSkip={handleLocationOnboardingSkip}
      />
    </div>
  );
};

export default Register;