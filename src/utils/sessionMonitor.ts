import { supabase } from './supabaseClient';

export class SessionMonitor {
  private static instance: SessionMonitor;
  private lastSessionCheck: Date = new Date();
  private sessionCheckCount: number = 0;

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  async checkSessionStatus(): Promise<{
    isValid: boolean;
    expiresAt?: number;
    timeUntilExpiry?: number;
    details: string;
  }> {
    this.sessionCheckCount++;
    this.lastSessionCheck = new Date();

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return {
          isValid: false,
          details: `Session check error: ${error.message}`
        };
      }

      if (!session) {
        return {
          isValid: false,
          details: 'No active session found'
        };
      }

      const now = Date.now() / 1000;
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt ? expiresAt - now : undefined;

      return {
        isValid: true,
        expiresAt,
        timeUntilExpiry,
        details: `Session valid. ${timeUntilExpiry ? `Expires in ${Math.round(timeUntilExpiry / 60)} minutes` : 'No expiry time'}`
      };
    } catch (error: any) {
      return {
        isValid: false,
        details: `Session check exception: ${error.message}`
      };
    }
  }

  getStats() {
    return {
      lastSessionCheck: this.lastSessionCheck,
      sessionCheckCount: this.sessionCheckCount,
      timeSinceLastCheck: Date.now() - this.lastSessionCheck.getTime()
    };
  }

  async logSessionInfo() {
    const status = await this.checkSessionStatus();
    const stats = this.getStats();
    
    console.group('🔍 Session Monitor Report');
    console.log('Session Status:', status.isValid ? '✅ Valid' : '❌ Invalid');
    console.log('Details:', status.details);
    if (status.timeUntilExpiry) {
      console.log('Time until expiry:', `${Math.round(status.timeUntilExpiry / 60)} minutes`);
    }
    console.log('Check count:', stats.sessionCheckCount);
    console.log('Last check:', stats.lastSessionCheck.toLocaleString());
    console.groupEnd();

    return status;
  }
}

// 全局实例
export const sessionMonitor = SessionMonitor.getInstance();

// 在开发环境下添加到 window 对象方便调试
if (import.meta.env.DEV) {
  (window as any).sessionMonitor = sessionMonitor;
  console.log('🔍 Session monitor available at window.sessionMonitor');
} 