import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu
} from '@mantine/core';
import { 
  IconSearch, 
  IconBell, 
  IconUser, 
  IconSettings, 
  IconLogout, 
  IconChevronDown,
  IconHome,
  IconCompass,
  IconMap,
  IconMessage
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="nav-enhanced">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/app/home" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gradient-primary hidden sm:block">
                LumaTrip
              </span>
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { to: '/app/home', icon: <IconHome className="w-4 h-4" />, label: '主页' },
                { to: '/app/discover', icon: <IconCompass className="w-4 h-4" />, label: '发现' },
                { to: '/app/map-example', icon: <IconMap className="w-4 h-4" />, label: '地图' },
                { to: '/app/messages', icon: <IconMessage className="w-4 h-4" />, label: '消息' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`tab-glass flex items-center space-x-2 px-3 py-2 hover:scale-105 transition-all duration-200 ${
                    location.pathname === item.to ? 'active' : ''
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="搜索目的地、用户或内容..."
                className="input-glass w-full pl-10 pr-4"
              />
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button className="tab-glass p-2 hover:scale-110 transition-transform">
                <IconBell className="w-5 h-5 text-gray-600" />
              </button>
              <div className="absolute -top-1 -right-1 w-3 h-3 gradient-secondary rounded-full"></div>
            </div>

            {/* Messages */}
            <Link to="/app/messages" className="tab-glass p-2 hover:scale-110 transition-transform">
              <IconMessage className="w-5 h-5 text-gray-600" />
            </Link>

            {/* User Menu */}
            <Menu shadow="lg" width={280} position="bottom-end" offset={8}>
              <Menu.Target>
                <button className="flex items-center space-x-3 tab-glass px-3 py-2 hover:scale-105 transition-all duration-200">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700">
                    {user?.email?.split('@')[0] || '用户'}
                  </span>
                  <IconChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </Menu.Target>
              
              <Menu.Dropdown className="glass-effect border border-white/20">
                <Menu.Label className="text-gray-600">我的账户</Menu.Label>
                <Menu.Item 
                  component={Link} 
                  to="/app/profile"
                  leftSection={<IconUser className="w-4 h-4 text-blue-600" />}
                  className="hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span className="text-gray-700">个人资料</span>
                </Menu.Item>
                <Menu.Item 
                  component={Link} 
                  to="/app/settings"
                  leftSection={<IconSettings className="w-4 h-4 text-purple-600" />}
                  className="hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <span className="text-gray-700">设置</span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={handleLogout}
                  leftSection={<IconLogout className="w-4 h-4 text-red-600" />}
                  className="hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span className="text-red-600">退出登录</span>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;