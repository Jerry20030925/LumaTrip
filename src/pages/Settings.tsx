import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
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
    <div className="settings-container" style={{ margin: '-2rem -1rem', width: 'calc(100% + 2rem)' }}>
      <div className="settings-header">
        <h1 className="settings-title">{t('settings')}</h1>
        <p className="settings-subtitle">{t('user_preferences')}</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2 className="section-title">{t('general')}</h2>
              
              <div className="setting-group">
                <h3 className="setting-title">{t('language')}</h3>
                <p className="setting-description">Choose your preferred language</p>
                <div className="language-grid">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span className="language-flag">{lang.flag}</span>
                      <span className="language-name">{lang.name}</span>
                      {i18n.language === lang.code && (
                        <span className="language-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <h3 className="setting-title">{t('theme')}</h3>
                <p className="setting-description">Customize your visual experience</p>
                <div className="theme-options">
                  <button className="theme-option active">
                    <span className="theme-preview light"></span>
                    <span>Light</span>
                  </button>
                  <button className="theme-option">
                    <span className="theme-preview dark"></span>
                    <span>Dark</span>
                  </button>
                  <button className="theme-option">
                    <span className="theme-preview auto"></span>
                    <span>Auto</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2 className="section-title">{t('account')}</h2>
              
              <div className="setting-group">
                <h3 className="setting-title">Profile Information</h3>
                <div className="profile-info">
                  <div className="profile-avatar">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="profile-details">
                    <p className="profile-email">{user?.email}</p>
                    <p className="profile-provider">
                      Provider: {user?.app_metadata?.provider || 'email'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <h3 className="setting-title">Account Actions</h3>
                <button className="action-button logout" onClick={handleLogout}>
                  {t('logout')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">{t('notifications')}</h2>
              
              <div className="setting-group">
                <h3 className="setting-title">Push Notifications</h3>
                <div className="notification-options">
                  <label className="notification-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Travel updates</span>
                  </label>
                  <label className="notification-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">AI recommendations</span>
                  </label>
                  <label className="notification-toggle">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Marketing emails</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;