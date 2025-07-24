import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Supabase URL and Anon Key must be defined');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // 设置自定义存储以确保 session 持久化
    storage: {
      getItem: (key: string) => {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      }
    }
  }
});