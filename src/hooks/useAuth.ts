import useAuthStore from '../stores/authStore';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  loginWithGoogle as loginWithGoogleService,
} from '../services/auth.service';

export const useAuth = () => {
  const {
    user,
    session,
    isAuthenticated,
    isLoading,
    setSession,
    logout: logoutStore,
  } = useAuthStore();

  // 认证初始化现在在App组件中处理，这里不再需要

  const login = async (email: string, password: string) => {
    const { session } = await loginService(email, password);
    setSession(session);
  };

  const register = async (email: string, password: string) => {
    const { session } = await registerService(email, password);
    setSession(session);
  };

  const loginWithGoogle = async () => {
    await loginWithGoogleService();
    // Note: OAuth redirect will handle session setting via auth state listener
  };

  const logout = async () => {
    await logoutService();
    logoutStore();
  };

  return { 
    user, 
    session, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    loginWithGoogle, 
    logout 
  };
};