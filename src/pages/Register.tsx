import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, TextInput, Stack, Text, Alert, Box, PasswordInput } from '@mantine/core';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import LocationOnboarding from '../components/location/LocationOnboarding';
import AuthLayout from '../components/layout/AuthLayout';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <>
      <AuthLayout
        title={t('welcome')}
        subtitle={t('sign_up')}
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

              <PasswordInput
                placeholder={t('confirm_password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? t('loading') : t('sign_up')}
              </Button>
            </Stack>
          </form>

          <Box style={{ textAlign: 'center' }}>
            <Text size="sm">
              {t('already_have_account')}{' '}
              <Text component={Link} to="/app/login" c="blue" fw={500}>
                {t('sign_in')}
              </Text>
            </Text>
          </Box>
        </Stack>
      </AuthLayout>

      {/* Location Onboarding Modal */}
      <LocationOnboarding
        isOpen={showLocationOnboarding}
        onComplete={handleLocationOnboardingComplete}
        onSkip={handleLocationOnboardingSkip}
      />
    </>
  );
};

export default Register;