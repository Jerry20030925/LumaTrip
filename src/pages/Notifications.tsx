import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Stack,
  Group,
  Badge,
  ActionIcon,
  Text,
  Tabs,
  Button,
  Center,
  Divider,
  Menu,
  Box
} from '@mantine/core';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  MapPin, 
  Settings, 
  Check, 
  CheckCheck, 
  Trash2,
  Filter,
  MoreHorizontal
} from 'lucide-react';
// import NotificationList from '../components/notifications/NotificationList';
// import { useNotifications } from '../hooks/useNotifications';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  // getUnreadCount,
  subscribeToNotifications,
  type NotificationData
} from '../services/notification.service';
import { useAuth } from '../hooks/useAuth';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { user } = useAuth();
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications(50);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Real-time notifications subscription
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: newNotification.avatar || '/icons/icon-192x192.png',
          tag: newNotification.id
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={16} color="#e74c3c" />;
      case 'comment':
        return <MessageCircle size={16} color="#3498db" />;
      case 'follow':
        return <UserPlus size={16} color="#2ecc71" />;
      case 'message':
        return <MessageCircle size={16} color="#9b59b6" />;
      case 'location':
        return <MapPin size={16} color="#f39c12" />;
      case 'system':
        return <Bell size={16} color="#34495e" />;
      default:
        return <Bell size={16} />;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all':
        return <Bell size={16} />;
      case 'likes':
        return <Heart size={16} />;
      case 'comments':
        return <MessageCircle size={16} />;
      case 'follows':
        return <UserPlus size={16} />;
      case 'messages':
        return <MessageCircle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.type === activeTab || 
      (activeTab === 'likes' && notification.type === 'like') ||
      (activeTab === 'comments' && notification.type === 'comment') ||
      (activeTab === 'follows' && notification.type === 'follow') ||
      (activeTab === 'messages' && notification.type === 'message');
    
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    return matchesTab && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handler functions removed to avoid unused variable warnings
  // These would be used for interaction buttons in the UI

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" radius="xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bell size={20} style={{ color: 'white' }} />
              </Box>
              <Stack gap={4}>
                <Title order={2} size="h3">通知中心</Title>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    {unreadCount > 0 ? `${unreadCount} 条未读` : '全部已读'}
                  </Text>
                  {unreadCount > 0 && (
                    <Badge variant="filled" color="red" size="sm" radius="xl">
                      {unreadCount}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Group>
            
            <Group gap="xs">
              <Menu>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg" radius="xl">
                    <Filter size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    onClick={() => setFilter('all')}
                    leftSection={<Bell size={14} />}
                  >
                    全部通知
                  </Menu.Item>
                  <Menu.Item 
                    onClick={() => setFilter('unread')}
                    leftSection={<Badge variant="filled" color="red" size="xs" />}
                  >
                    未读通知
                  </Menu.Item>
                  <Menu.Item 
                    onClick={() => setFilter('read')}
                    leftSection={<CheckCheck size={14} />}
                  >
                    已读通知
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              
              {unreadCount > 0 && (
                <Button
                  variant="subtle"
                  size="sm"
                  leftSection={<CheckCheck size={16} />}
                  onClick={markAllAsRead}
                >
                  全部标记为已读
                </Button>
              )}
              
              <ActionIcon variant="subtle" size="lg" radius="xl">
                <Settings size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>

        {/* Tabs */}
        <Paper p="md" radius="xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
            <Tabs.List>
              <Tabs.Tab value="all" leftSection={getTabIcon('all')}>
                全部
              </Tabs.Tab>
              <Tabs.Tab value="like" leftSection={getTabIcon('likes')}>
                点赞
              </Tabs.Tab>
              <Tabs.Tab value="comment" leftSection={getTabIcon('comments')}>
                评论
              </Tabs.Tab>
              <Tabs.Tab value="follow" leftSection={getTabIcon('follows')}>
                关注
              </Tabs.Tab>
              <Tabs.Tab value="message" leftSection={getTabIcon('messages')}>
                消息
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Paper>

        {/* Notifications List */}
        <Paper radius="xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {loading ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <Bell size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
                <Text c="dimmed">加载中...</Text>
              </Stack>
            </Center>
          ) : filteredNotifications.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <Bell size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
                <Text c="dimmed">
                  {filter === 'unread' ? '没有未读通知' : '没有通知'}
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap={0}>
              {filteredNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Group
                    p="md"
                    gap="md"
                    style={{
                      backgroundColor: notification.read ? 'transparent' : 'var(--mantine-color-blue-0)',
                      cursor: 'pointer',
                      borderRadius: index === 0 ? '12px 12px 0 0' : 
                        index === filteredNotifications.length - 1 ? '0 0 12px 12px' : '0'
                    }}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    {/* Icon */}
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--mantine-color-gray-2)'
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>

                    {/* Content */}
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group justify="space-between">
                        <Text fw={notification.read ? 400 : 600} size="sm">
                          {notification.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatTime(notification.timestamp)}
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {notification.message}
                      </Text>
                    </Stack>

                    {/* Actions */}
                    <Menu>
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" radius="xl">
                          <MoreHorizontal size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {!notification.read && (
                          <Menu.Item
                            leftSection={<Check size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            标记为已读
                          </Menu.Item>
                        )}
                        <Menu.Item
                          leftSection={<Trash2 size={14} />}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          删除通知
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  
                  {index < filteredNotifications.length - 1 && (
                    <Divider size="xs" />
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default Notifications;