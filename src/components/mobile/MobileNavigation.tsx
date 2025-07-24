import React, { useState, useEffect } from 'react';
import { Home, Search, Plus, User, MessageCircle, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

interface MobileNavigationProps {
  currentUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  unreadCount?: number;
  notificationCount?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentUser,
  unreadCount = 0,
  notificationCount = 0
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 强制确保移动端导航可见
  useEffect(() => {
    const checkAndForceDisplay = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) {
        // 强制显示移动端导航
        const mobileNavTop = document.querySelector('.mobile-nav-top');
        const mobileNavBottom = document.querySelector('.mobile-nav-bottom');
        
        if (mobileNavTop) {
          (mobileNavTop as HTMLElement).style.display = 'flex';
          (mobileNavTop as HTMLElement).style.position = 'fixed';
          (mobileNavTop as HTMLElement).style.top = '0';
          (mobileNavTop as HTMLElement).style.left = '0';
          (mobileNavTop as HTMLElement).style.right = '0';
          (mobileNavTop as HTMLElement).style.zIndex = '9999';
          (mobileNavTop as HTMLElement).style.background = 'rgba(255, 255, 255, 0.98)';
          (mobileNavTop as HTMLElement).style.backdropFilter = 'blur(16px)';
        }
        
        if (mobileNavBottom) {
          (mobileNavBottom as HTMLElement).style.display = 'grid';
          (mobileNavBottom as HTMLElement).style.position = 'fixed';
          (mobileNavBottom as HTMLElement).style.bottom = '0';
          (mobileNavBottom as HTMLElement).style.zIndex = '9999';
        }
        
        // 隐藏桌面端导航（仅在移动端）
        const desktopHeaders = document.querySelectorAll('.nav-enhanced, .desktop-header, header.nav-enhanced');
        desktopHeaders.forEach(header => {
          (header as HTMLElement).style.display = 'none';
        });
      } else {
        // 桌面端：隐藏移动端导航，显示桌面端导航
        const mobileNavTop = document.querySelector('.mobile-nav-top');
        const mobileNavBottom = document.querySelector('.mobile-nav-bottom');
        
        if (mobileNavTop) {
          (mobileNavTop as HTMLElement).style.display = 'none';
        }
        
        if (mobileNavBottom) {
          (mobileNavBottom as HTMLElement).style.display = 'none';
        }
        
        // 确保桌面端导航显示
        const desktopHeaders = document.querySelectorAll('.nav-enhanced, .desktop-header, header.nav-enhanced');
        desktopHeaders.forEach(header => {
          (header as HTMLElement).style.display = 'block';
        });
      }
    };

    // 立即执行
    checkAndForceDisplay();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkAndForceDisplay);
    
    // 延迟执行确保DOM完全加载
    const timer = setTimeout(checkAndForceDisplay, 100);
    
    return () => {
      window.removeEventListener('resize', checkAndForceDisplay);
      clearTimeout(timer);
    };
  }, []);

  // 如果不是移动端，不渲染任何内容
  if (!isMobile) {
    return null;
  }

  const mainNavItems = [
    { id: 'home', label: '首页', icon: Home, path: '/app/home' },
    { id: 'search', label: '搜索', icon: Search, path: '/app/search' },
    { id: 'create', label: '创建', icon: Plus, path: '/create', isSpecial: true },
    { id: 'notifications', label: '通知', icon: Bell, path: '/app/notifications', badge: notificationCount },
    { id: 'profile', label: '我的', icon: User, path: '/app/profile' }
  ];

  const menuItems = [
    { id: 'messages', label: '消息', icon: MessageCircle, path: '/app/messages', badge: unreadCount },
    { id: 'discover', label: '发现', path: '/app/discover' },
    { id: 'friends', label: '朋友', path: '/app/friends' },
    { id: 'saved', label: '收藏', path: '/app/saved' },
    { id: 'settings', label: '设置', path: '/app/settings' }
  ];

  const createOptions = [
    { id: 'post', label: '发帖子', icon: '📝' },
    { id: 'story', label: '发动态', icon: '📱' },
    { id: 'live', label: '直播', icon: '📺' },
    { id: 'event', label: '活动', icon: '🎉' }
  ];

  const handleNavigation = (path: string, isSpecial?: boolean) => {
    if (isSpecial) {
      setShowCreateMenu(true);
    } else {
      navigate(path);
      setIsMenuOpen(false);
    }
  };

  const handleCreateOption = (option: string) => {
    setShowCreateMenu(false);
    // Handle create option
    console.log('Create option:', option);
  };

  const isActive = (path: string) => {
    if (path === '/app/home') {
      return location.pathname === '/app/home';
    }
    return location.pathname.startsWith(path);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (showCreateMenu) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, showCreateMenu]);

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="mobile-nav-bottom fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-filter backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 md:hidden shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.isSpecial)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  {item.isSpecial ? (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Create Menu */}
      <AnimatePresence>
        {showCreateMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-end justify-center p-4 md:hidden"
            onClick={() => setShowCreateMenu(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                创建内容
              </h3>
              
              <div className="space-y-3">
                {createOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleCreateOption(option.id)}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{option.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCreateMenu(false)}
                className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation for Mobile */}
      <nav 
        className="mobile-nav-top"
        style={{
          display: 'flex',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          zIndex: '9999',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          flexDirection: 'column',
          padding: '0'
        }}
      >
        <div style={{ padding: '12px 16px' }}>
          {/* Main Header Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            {/* Left Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <button
                onClick={() => setIsMenuOpen(true)}
                style={{
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="打开菜单"
              >
                <Menu style={{ width: '20px', height: '20px', color: '#374151' }} />
              </button>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                  <span style={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: '14px' 
                  }}>L</span>
                </div>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    lineHeight: '1.2'
                  }}>
                    LumaTrip
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1'
                  }}>
                    智能旅行助手
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              {/* Search Button */}
              <button 
                style={{
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="搜索"
              >
                <Search style={{ width: '20px', height: '20px', color: '#6b7280' }} />
              </button>
              
              {/* Notifications */}
              <button 
                style={{
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                aria-label="通知"
              >
                <Bell style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                {notificationCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '20px',
                    height: '20px',
                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </div>
                )}
              </button>
              
              {/* User Avatar */}
              <button 
                style={{
                  padding: '4px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                aria-label="用户菜单"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Secondary Row - Quick Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            paddingBottom: '4px'
          }}>
            {[
              { icon: Home, label: '首页', path: '/app/home' },
              { icon: Search, label: '发现', path: '/app/discover' },
              { icon: MessageCircle, label: '消息', path: '/app/messages' },
              { icon: User, label: '我的', path: '/app/profile' }
            ].map((item, index) => {
              const Icon = item.icon;
              const itemIsActive = isActive(item.path);
              
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: itemIsActive 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'transparent',
                    color: itemIsActive ? '#3b82f6' : '#6b7280'
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-80 h-full bg-white dark:bg-gray-900 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    菜单
                  </h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {currentUser && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {currentUser.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        查看个人资料
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                        <span className="text-gray-900 dark:text-white font-medium">
                          {item.label}
                        </span>
                      </div>
                      
                      {item.badge && item.badge > 0 && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    LumaTrip v1.0.0
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;