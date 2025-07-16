import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const DebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const info: any = {
          timestamp: new Date().toISOString(),
          environment: {
            supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
            supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
            openaiKey: !!import.meta.env.VITE_OPENAI_API_KEY,
            nodeEnv: import.meta.env.NODE_ENV,
            mode: import.meta.env.MODE,
          },
          supabase: {
            connected: false,
            error: null,
            session: null
          }
        };

        // 测试 Supabase 连接
        try {
          const { data, error } = await supabase.auth.getSession();
          info.supabase.connected = !error;
          info.supabase.error = error?.message || null;
          info.supabase.session = !!data.session;
        } catch (err: any) {
          info.supabase.error = err.message;
        }

        setDebugInfo(info);
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>检查环境...</div>;
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>调试信息</h1>
      <pre style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px',
        overflow: 'auto'
      }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default DebugPage;