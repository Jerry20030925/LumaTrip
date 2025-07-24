import React, { useState, useEffect } from 'react';
import { authDebugger } from '../utils/authDebugger';
import { RefreshCw, Bug, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AuthDebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

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

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshDebugInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getIssueIcon = (issue: string) => {
    if (issue.includes('✅')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (issue.includes('❌')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (issue.includes('⏳') || issue.includes('🔄')) return <RefreshCw className="w-4 h-4 text-blue-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">认证状态调试</h1>
                <p className="text-gray-600">诊断为什么会回到登录界面</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">自动刷新</span>
              </label>
              <button
                onClick={refreshDebugInfo}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>
          </div>

          {/* 问题诊断 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔧 问题诊断</h2>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getIssueIcon(issue)}
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 快速修复 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 快速修复</h2>
            <div className="flex space-x-3">
              <button
                onClick={attemptFix}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                尝试修复认证状态
              </button>
              <button
                onClick={clearAllAuth}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                清除所有认证状态
              </button>
              <a
                href="/app/login"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 inline-block"
              >
                前往登录页面
              </a>
            </div>
          </div>

          {/* 详细信息 */}
          {debugInfo && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 详细信息</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">基本信息</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>时间:</strong> {debugInfo.timestamp}</p>
                    <p><strong>当前URL:</strong> {debugInfo.currentUrl}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Session 过期信息</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>过期时间:</strong> {debugInfo.sessionExpiry.expiresAt || '未知'}</p>
                    <p><strong>当前时间:</strong> {debugInfo.sessionExpiry.currentTime}</p>
                    <p><strong>剩余时间:</strong> {
                      debugInfo.sessionExpiry.timeUntilExpiry
                        ? `${Math.round(debugInfo.sessionExpiry.timeUntilExpiry / 60)} 分钟`
                        : '未知'
                    }</p>
                    <p><strong>是否过期:</strong> {debugInfo.sessionExpiry.isExpired ? '是' : '否'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Supabase Session</h3>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.session, null, 2)}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Zustand 状态</h3>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.zustandState, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">LocalStorage 认证数据</h3>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(debugInfo.localStorageAuth, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 操作指南 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🔍 调试指南</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• 如果 "Supabase session 为空"，尝试重新登录</p>
              <p>• 如果 "Session 已过期"，这是正常的，需要重新登录</p>
              <p>• 如果 "Session 存在但 Zustand 状态不同步"，点击"尝试修复认证状态"</p>
              <p>• 如果问题持续存在，使用"清除所有认证状态"然后重新登录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage; 