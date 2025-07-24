import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../utils/supabaseClient';

interface AuthState {
  user: any | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setLoading: (isLoading: boolean) => void;
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
        
        // 强制设置认证状态为 true，不检查过期时间
        const isAuthenticated = !!(session?.user);
        
        set((state) => ({ 
          ...state, 
          session, 
          user: session?.user ?? null, 
          isAuthenticated,
          isLoading: false 
        }));
        
        // 永久化存储认证状态，避免页面刷新丢失
        if (session?.user) {
          localStorage.setItem('lumatrip-persistent-auth', JSON.stringify({
            user: session.user,
            timestamp: Date.now(),
            // 不存储过期时间，让用户可以永久使用
          }));
        }
      },
      setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
      logout: () => {
        console.log('Logging out user');
        localStorage.removeItem('lumatrip-persistent-auth');
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      },
      initialize: async () => {
        try {
          // 首先检查持久化存储
          const persistentAuth = localStorage.getItem('lumatrip-persistent-auth');
          if (persistentAuth) {
            try {
              const authData = JSON.parse(persistentAuth);
              // 如果有持久化的认证数据，直接使用
              if (authData.user) {
                console.log('Found persistent auth, using cached user:', authData.user.email);
                set({
                  user: authData.user,
                  session: { user: authData.user }, // 创建一个基本的 session 对象
                  isAuthenticated: true,
                  isLoading: false
                });
                return;
              }
            } catch (e) {
              console.warn('Failed to parse persistent auth:', e);
              localStorage.removeItem('lumatrip-persistent-auth');
            }
          }
          
          // 如果没有持久化数据，尝试从 Supabase 获取
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

// 初始化认证监听器
if (typeof window !== 'undefined') {
  initializeAuthListener();
}

export default useAuthStore;