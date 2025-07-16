import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set((state) => ({ 
    ...state, 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  })),
  setSession: (session) => set((state) => ({ 
    ...state, 
    session, 
    user: session?.user ?? null, 
    isAuthenticated: !!session?.user,
    isLoading: false 
  })),
  setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
  logout: () => set({ user: null, session: null, isAuthenticated: false, isLoading: false }),
  initialize: async () => {
    // 认证初始化现在在App组件中处理
    // 这个方法保留用于向后兼容
    console.log('Auth store initialize called - handled by App component');
  },
}));

// 统一的认证状态监听器
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  console.log('Auth state change:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    store.setSession(session);
  } else if (event === 'SIGNED_OUT') {
    store.logout();
  } else if (event === 'INITIAL_SESSION') {
    // 处理初始会话
    store.setSession(session);
  }
});

export default useAuthStore;