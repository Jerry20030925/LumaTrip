import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
      setSession: (session) => {
        console.log('Setting session:', session?.user?.email);
        set((state) => ({ 
          ...state, 
          session, 
          user: session?.user ?? null, 
          isAuthenticated: !!session?.user,
          isLoading: false 
        }));
      },
      setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
      logout: () => {
        console.log('Logging out user');
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      },
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Initialize auth with session:', session?.user?.email);
          get().setSession(session);
        } catch (error) {
          console.error('Auth initialize error:', error);
          get().setSession(null);
        }
      },
    }),
    {
      name: 'lumatrip-auth', // 存储key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// 统一的认证状态监听器
let authListener: any = null;

const initializeAuthListener = () => {
  if (authListener) {
    authListener.unsubscribe();
  }
  
  authListener = supabase.auth.onAuthStateChange(async (event, session) => {
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
};

// 初始化监听器
initializeAuthListener();

export default useAuthStore;