import { supabase } from './supabaseClient';
import useAuthStore from '../stores/authStore';

interface DebugInfo {
  timestamp: string;
  currentUrl: string;
  session: any;
  localStorageAuth: any;
  zustandState: any;
  sessionExpiry: {
    expiresAt?: number;
    currentTime: number;
    timeUntilExpiry?: number;
    isExpired: boolean;
  };
}

export class AuthDebugger {
  private static instance: AuthDebugger;
  private debugHistory: DebugInfo[] = [];

  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  async collectDebugInfo(): Promise<DebugInfo> {
    try {
      // 获取当前 Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      // 获取 localStorage 中的认证状态
      const localStorageAuth = localStorage.getItem('lumatrip-auth');
      let parsedLocalAuth = null;
      if (localStorageAuth) {
        try {
          parsedLocalAuth = JSON.parse(localStorageAuth);
        } catch (e) {
          parsedLocalAuth = 'Parse Error: ' + e;
        }
      }

      // 获取 Zustand store 状态
      const zustandState = useAuthStore.getState();

      // 分析 session 过期时间
      const currentTime = Date.now() / 1000;
      const sessionExpiry = {
        expiresAt: session?.expires_at,
        currentTime,
        timeUntilExpiry: session?.expires_at ? session.expires_at - currentTime : undefined,
        isExpired: session?.expires_at ? currentTime > session.expires_at : false
      };

      const debugInfo: DebugInfo = {
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        session: session ? {
          user: session.user?.email,
          access_token: session.access_token ? 'present' : 'missing',
          refresh_token: session.refresh_token ? 'present' : 'missing',
          expires_at: session.expires_at,
          token_type: session.token_type
        } : null,
        localStorageAuth: parsedLocalAuth,
        zustandState: {
          isAuthenticated: zustandState.isAuthenticated,
          isLoading: zustandState.isLoading,
          user: zustandState.user?.email,
          session: zustandState.session ? 'present' : 'null'
        },
        sessionExpiry
      };

      this.debugHistory.push(debugInfo);
      // 只保留最近的 10 条记录
      if (this.debugHistory.length > 10) {
        this.debugHistory = this.debugHistory.slice(-10);
      }

      return debugInfo;
    } catch (error: any) {
      const errorInfo: DebugInfo = {
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        session: `Error: ${error.message}`,
        localStorageAuth: null,
        zustandState: null,
        sessionExpiry: {
          currentTime: Date.now() / 1000,
          isExpired: true
        }
      };

      this.debugHistory.push(errorInfo);
      return errorInfo;
    }
  }

  async logCurrentState() {
    const info = await this.collectDebugInfo();
    
    console.group('🔍 认证状态调试信息');
    console.log('时间:', info.timestamp);
    console.log('当前URL:', info.currentUrl);
    console.log('Supabase Session:', info.session);
    console.log('LocalStorage Auth:', info.localStorageAuth);
    console.log('Zustand State:', info.zustandState);
    console.log('Session 过期信息:', info.sessionExpiry);
    
    if (info.sessionExpiry.timeUntilExpiry) {
      const minutes = Math.round(info.sessionExpiry.timeUntilExpiry / 60);
      console.log(`⏰ Session 将在 ${minutes} 分钟后过期`);
    }
    
    if (info.sessionExpiry.isExpired) {
      console.warn('❌ Session 已过期');
    }

    console.groupEnd();

    return info;
  }

  getDebugHistory() {
    return this.debugHistory;
  }

  // 检查为什么用户被重定向到登录页面
  async diagnoseLoginRedirect(): Promise<string[]> {
    const info = await this.collectDebugInfo();
    const issues: string[] = [];

    // 检查各种可能的问题
    if (!info.session) {
      issues.push('❌ Supabase session 为空');
    }

    if (!info.zustandState.isAuthenticated) {
      issues.push('❌ Zustand 认证状态为 false');
    }

    if (info.zustandState.isLoading) {
      issues.push('⏳ Zustand 仍在加载状态');
    }

    if (info.sessionExpiry.isExpired) {
      issues.push('⏰ Session 已过期');
    }

    if (info.sessionExpiry.timeUntilExpiry && info.sessionExpiry.timeUntilExpiry < 0) {
      issues.push(`⏰ Session 过期 ${Math.abs(Math.round(info.sessionExpiry.timeUntilExpiry / 60))} 分钟前`);
    }

    if (info.session && !info.zustandState.isAuthenticated) {
      issues.push('🔄 Session 存在但 Zustand 状态不同步');
    }

    if (!info.localStorageAuth) {
      issues.push('💾 LocalStorage 中没有认证数据');
    }

    if (issues.length === 0) {
      issues.push('✅ 没有发现明显问题，可能是时序问题');
    }

    console.group('🔧 登录重定向诊断');
    issues.forEach(issue => console.log(issue));
    console.groupEnd();

    return issues;
  }

  // 尝试修复认证状态
  async attemptFix(): Promise<boolean> {
    try {
      console.log('🔧 尝试修复认证状态...');
      
      // 1. 强制获取最新 session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ 找到有效 session，更新 Zustand 状态');
        useAuthStore.getState().setSession(session);
        return true;
      } else {
        console.log('❌ 没有找到有效 session');
        return false;
      }
    } catch (error) {
      console.error('修复失败:', error);
      return false;
    }
  }

  // 强制清除所有认证状态
  clearAllAuthState() {
    console.log('🧹 清除所有认证状态...');
    
    // 清除 Zustand
    useAuthStore.getState().logout();
    
    // 清除 localStorage
    localStorage.removeItem('lumatrip-auth');
    localStorage.removeItem('sb-' + 'lumatrip' + '-auth-token');
    
    // 清除 sessionStorage
    sessionStorage.clear();
    
    console.log('✅ 认证状态已清除');
  }
}

// 全局实例
export const authDebugger = AuthDebugger.getInstance();

// 在开发环境下添加到 window 对象
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).authDebugger = authDebugger;
  console.log('🔍 Auth debugger available at window.authDebugger');
} 