import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const languages = [
    { code: 'en', name: t('english'), flag: '🇺🇸' },
    { code: 'zh-CN', name: t('chinese_simplified'), flag: '🇨🇳' },
    { code: 'zh-TW', name: t('chinese_traditional'), flag: '🇹🇼' },
    { code: 'ja', name: t('japanese'), flag: '🇯🇵' },
    { code: 'ko', name: t('korean'), flag: '🇰🇷' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const tabs = [
    { id: 'general', label: t('general'), icon: '⚙️' },
    { id: 'account', label: t('account'), icon: '👤' },
    { id: 'notifications', label: t('notifications'), icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 导航头部 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 返回按钮 */}
              <Link 
                to="/app/home"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:translate-x-[-2px] transition-transform" />
                <span className="text-blue-600 font-medium">返回主页</span>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">设置</h1>
                  <p className="text-sm text-gray-500">管理您的账户和偏好设置</p>
                </div>
              </div>
            </div>
            
            {/* 快捷导航 */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/app/home"
                className="p-2 bg-green-100 hover:bg-green-200 rounded-xl transition-colors group"
                title="主页"
              >
                <Home className="w-5 h-5 text-green-600" />
              </Link>
              <Link 
                to="/app/profile"
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                title="个人资料"
              >
                <span className="text-blue-600">👤</span>
              </Link>
              <Link 
                to="/app/map-example"
                className="p-2 bg-orange-100 hover:bg-orange-200 rounded-xl transition-colors"
                title="地图"
              >
                <span className="text-orange-600">🗺️</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-4 gap-0">
            {/* 侧边栏 */}
            <div className="lg:col-span-1 bg-gray-50 border-r border-gray-200">
              <div className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4">设置分类</h2>
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 主内容区 */}
            <div className="lg:col-span-3 p-6">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">常规设置</h2>
                    <p className="text-gray-600">自定义您的应用体验</p>
                  </div>
                  
                  {/* 语言设置 */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">语言</h3>
                    <p className="text-gray-600 mb-4">选择您偏好的语言</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                            i18n.language === lang.code 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => handleLanguageChange(lang.code)}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{lang.name}</div>
                          </div>
                          {i18n.language === lang.code && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 主题设置 */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">主题</h3>
                    <p className="text-gray-600 mb-4">自定义您的视觉体验</p>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="flex flex-col items-center space-y-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
                        <div className="w-12 h-8 bg-gradient-to-r from-white to-gray-100 rounded border border-gray-200"></div>
                        <span className="font-medium text-blue-700">浅色</span>
                      </button>
                      <button className="flex flex-col items-center space-y-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white">
                        <div className="w-12 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded"></div>
                        <span className="font-medium text-gray-700">深色</span>
                      </button>
                      <button className="flex flex-col items-center space-y-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white">
                        <div className="w-12 h-8 bg-gradient-to-r from-white via-gray-400 to-gray-900 rounded"></div>
                        <span className="font-medium text-gray-700">自动</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">账户设置</h2>
                    <p className="text-gray-600">管理您的账户信息</p>
                  </div>
                  
                  {/* 用户信息 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">用户信息</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        {user?.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                        <p className="text-gray-600">
                          登录方式: {user?.app_metadata?.provider || 'email'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 账户操作 */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">账户操作</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={handleLogout}
                        className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">通知设置</h2>
                    <p className="text-gray-600">管理您接收的通知类型</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">推送通知</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'travel', label: '旅行更新', description: '接收行程和目的地相关的通知', defaultChecked: true },
                        { id: 'ai', label: 'AI 推荐', description: '基于您的偏好接收个性化推荐', defaultChecked: true },
                        { id: 'marketing', label: '营销邮件', description: '接收促销和新功能通知', defaultChecked: false }
                      ].map((item) => (
                        <label key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              defaultChecked={item.defaultChecked}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors">
                              <div className="w-4 h-4 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-6 translate-x-1 mt-1"></div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;