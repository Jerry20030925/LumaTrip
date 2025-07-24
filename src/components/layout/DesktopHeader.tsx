import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IconBell,
  IconSearch,
  IconChevronDown,
  IconHome,
  IconCompass,
  IconMap,
  IconMessage,
  IconUser,
  IconSettings,
  IconHelpCircle,
  IconLogout
} from '@tabler/icons-react';
import { Menu, ActionIcon, Avatar, Indicator, Text, Group, Button } from '@mantine/core';
import { MapPin, Globe, MessageCircle } from 'lucide-react';

interface DesktopHeaderProps {
  user?: {
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  };
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCount] = useState(3);

  const navigationItems = [
    { to: '/app/home', icon: IconHome, label: '主页' },
    { to: '/app/discover', icon: IconCompass, label: '发现' },
    { to: '/app/map-example', icon: IconMap, label: '地图' },
    { to: '/app/messages', icon: IconMessage, label: '消息' }
  ];

  const handleLogout = () => {
    // 这里应该调用实际的登出逻辑
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/auth/login';
  };

  return (
    <header
      style={{
        display: 'block',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        margin: 0,
        padding: 0
      }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px'
      }}>

        {/* 左侧 Logo */}
        <Link to="/app/home" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <span style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>L</span>
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              LumaTrip
            </span>
          </div>
        </Link>

        {/* 中间导航链接 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : '#6b7280',
                  background: isActive
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 中央搜索栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '6px 16px',
          minWidth: '300px',
          backdropFilter: 'blur(10px)'
        }}>
          <IconSearch size={16} style={{ color: '#9ca3af', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="搜索精彩内容..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '14px',
              color: '#374151'
            }}
          />
        </div>

        {/* 右侧功能区 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* 通知 */}
          <Indicator inline size={16} offset={7} position="top-end" color="red" disabled={notificationCount === 0}>
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              <IconBell size={18} />
            </ActionIcon>
          </Indicator>

          {/* 消息 */}
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            onClick={() => navigate('/app/messages')}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <IconMessage size={18} />
          </ActionIcon>

          {/* 用户菜单 */}
          <Menu shadow="md" width={220}>
            <Menu.Target>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  size={28}
                  radius="xl"
                />
                <Text size="sm" fw={500} style={{ color: '#374151' }}>
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || '用户'}
                </Text>
                <IconChevronDown size={14} style={{ color: '#9ca3af' }} />
              </div>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>个人中心</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => navigate('/app/profile')}
              >
                个人主页
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => navigate('/app/settings')}
              >
                设置
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>帮助与支持</Menu.Label>
              <Menu.Item
                leftSection={<IconHelpCircle size={16} />}
                onClick={() => navigate('/app/support')}
              >
                反馈与支持
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={handleLogout}
              >
                退出登录
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Group gap="xs">
            <Button
              variant="subtle"
              size="sm"
              component={Link}
              to="/app/map-example"
              leftSection={<MapPin size={16} />}
            >
              苹果地图
            </Button>
            <Button
              variant="subtle"
              size="sm"
              component={Link}
              to="/app/support"
              leftSection={<MessageCircle size={16} />}
            >
              反馈
            </Button>
          </Group>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader; 