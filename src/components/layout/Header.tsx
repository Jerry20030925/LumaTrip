import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { AppShell, Group, Button, Anchor, Title, Avatar, Indicator, ActionIcon, Menu, rem } from '@mantine/core';
import { IconBell, IconSearch, IconUser, IconSettings, IconLogout, IconChevronDown } from '@tabler/icons-react';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  const navLinkStyle = (path: string) => ({
    color: isActivePage(path) ? '#1976d2' : 'inherit',
    fontWeight: isActivePage(path) ? 600 : 400,
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f5f5f5',
      color: '#1976d2'
    }
  });

  return (
    <AppShell.Header p="md" style={{ 
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <Group justify="space-between" h="100%">
        {/* Logo */}
        <Anchor component={Link} to="/" underline="never" style={{ color: 'inherit' }}>
          <Group gap="xs">
            <img 
              src="/luma-logo.svg" 
              alt="LumaTrip Logo" 
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px'
              }}
            />
            <Title order={3} style={{ 
              background: 'linear-gradient(135deg, #87CEEB 0%, #5DADE2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              LumaTrip
            </Title>
          </Group>
        </Anchor>

        {/* Navigation Links */}
        <Group gap="xs" visibleFrom="sm">
          <Anchor component={Link} to="/" style={navLinkStyle('/')}>
            {t('home')}
          </Anchor>
          <Anchor component={Link} to="/discover" style={navLinkStyle('/discover')}>
            {t('discover') || '发现'}
          </Anchor>
          {isAuthenticated && (
            <>
              <Anchor component={Link} to="/messages" style={navLinkStyle('/messages')}>
                {t('messages')}
              </Anchor>
              <Anchor component={Link} to="/app/map-example" style={navLinkStyle('/app/map-example')}>
                地图
              </Anchor>
              <Anchor component={Link} to={`/profile/${user?.id}`} style={navLinkStyle(`/profile/${user?.id}`)}>
                {t('profile')}
              </Anchor>
            </>
          )}
        </Group>

        {/* Right Side Actions */}
        <Group gap="xs">
          {/* Search Icon */}
          <ActionIcon variant="subtle" size="lg" radius="md">
            <IconSearch style={{ width: rem(20), height: rem(20) }} />
          </ActionIcon>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Indicator inline size={8} offset={7} position="top-end" color="red" withBorder>
                <ActionIcon variant="subtle" size="lg" radius="md">
                  <IconBell style={{ width: rem(20), height: rem(20) }} />
                </ActionIcon>
              </Indicator>

              {/* User Menu */}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Group style={{ cursor: 'pointer' }} gap="xs">
                    <Avatar 
                      src={user?.user_metadata?.avatar_url} 
                      size={32} 
                      radius="xl"
                      style={{ border: '2px solid #e0e0e0' }}
                    >
                      <IconUser size={16} />
                    </Avatar>
                    <IconChevronDown size={14} style={{ color: '#666' }} />
                  </Group>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>我的账户</Menu.Label>
                  <Menu.Item 
                    component={Link} 
                    to={`/profile/${user?.id}`}
                    leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                  >
                    个人资料
                  </Menu.Item>
                  <Menu.Item 
                    component={Link} 
                    to="/settings"
                    leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                  >
                    设置
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    color="red"
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                    onClick={logout}
                  >
                    退出登录
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          ) : (
            <Group gap="xs">
              <Button 
                component={Link} 
                to="/login" 
                variant="subtle"
                size="sm"
                radius="md"
              >
                {t('login')}
              </Button>
              <Button 
                component={Link} 
                to="/register"
                size="sm"
                radius="md"
                style={{
                  background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)',
                  border: 'none'
                }}
              >
                {t('register')}
              </Button>
            </Group>
          )}
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default Header;