import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import { authDebugger } from '../utils/authDebugger';

const DebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { session, isAuthenticated, user } = useAuthStore();

  const refreshDebugInfo = async () => {
    setLoading(true);
    try {
      const info = await authDebugger.logCurrentState();
      const diagnosedIssues = await authDebugger.diagnoseLoginRedirect();
      setDebugInfo(info);
      setIssues(diagnosedIssues);
    } catch (error) {
      console.error('Debug refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const attemptFix = async () => {
    setLoading(true);
    try {
      const success = await authDebugger.attemptFix();
      if (success) {
        alert('修复成功！页面将刷新。');
        window.location.reload();
      } else {
        alert('修复失败，请手动重新登录。');
      }
    } catch (error) {
      alert('修复过程中出现错误: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllAuth = () => {
    if (confirm('确定要清除所有认证状态吗？这将会登出当前用户。')) {
      authDebugger.clearAllAuthState();
      alert('认证状态已清除，页面将刷新。');
      window.location.href = '/app/login';
    }
  };

  useEffect(() => {
    refreshDebugInfo();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🔍 LumaTrip 调试页面</h1>
        
        {/* 基本信息 */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>📊 基本信息</h2>
          <p><strong>当前URL:</strong> {window.location.href}</p>
          <p><strong>时间:</strong> {new Date().toLocaleString('zh-CN')}</p>
          <p><strong>用户已认证:</strong> {isAuthenticated ? '✅ 是' : '❌ 否'}</p>
          <p><strong>Session 存在:</strong> {session ? '✅ 是' : '❌ 否'}</p>
          <p><strong>用户邮箱:</strong> {user?.email || '无'}</p>
        </div>

        {/* 问题诊断 */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>🔧 问题诊断</h2>
          {issues.length > 0 ? (
            <ul>
              {issues.map((issue, index) => (
                <li key={index} style={{ margin: '10px 0' }}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p>加载中...</p>
          )}
        </div>

        {/* 快速操作 */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>🚀 快速操作</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={refreshDebugInfo}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '刷新中...' : '刷新状态'}
            </button>
            
            <button
              onClick={attemptFix}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              尝试修复
            </button>
            
            <button
              onClick={clearAllAuth}
              style={{
                padding: '10px 20px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              清除认证状态
            </button>
            
            <a
              href="/app/login"
              style={{
                padding: '10px 20px',
                background: '#FF9800',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                display: 'inline-block'
              }}
            >
              前往登录
            </a>

            <a
              href="/app/home"
              style={{
                padding: '10px 20px',
                background: '#9C27B0',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                display: 'inline-block'
              }}
            >
              前往主页
            </a>
          </div>
        </div>

        {/* 详细信息 */}
        {debugInfo && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2>📋 详细调试信息</h2>
            <details>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>点击展开详细信息</summary>
              <pre style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '15px', 
                borderRadius: '5px', 
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* 手动测试 */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>🧪 手动测试</h2>
          <p>如果您熟悉开发者工具，可以在浏览器控制台中运行：</p>
          <code style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '10px', 
            borderRadius: '5px', 
            display: 'block',
            marginTop: '10px'
          }}>
            await window.authDebugger.logCurrentState();<br/>
            await window.authDebugger.diagnoseLoginRedirect();
          </code>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;