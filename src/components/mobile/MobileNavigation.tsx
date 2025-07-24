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
  const location = useLocation();
  const navigate = useNavigate();

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
      <nav className="mobile-nav-top fixed top-0 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-filter backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 md:hidden shadow-sm">
        <div className="px-4 py-3">
          {/* Main Header Row */}
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
                aria-label="打开菜单"
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    LumaTrip
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                    智能旅行助手
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button 
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
                aria-label="搜索"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              {/* Notifications */}
              <button 
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105 relative"
                aria-label="通知"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs text-white font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </div>
                )}
              </button>
              
              {/* User Avatar */}
              <button 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
                aria-label="用户菜单"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Secondary Row - Quick Actions */}
          <div className="flex items-center justify-center space-x-1 mt-3 pb-1">
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    itemIsActive 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.label}</span>
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