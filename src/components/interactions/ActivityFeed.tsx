import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Avatar,
  Text,
  Paper,
  Badge,
  ActionIcon,
  Image,
  Button,
  Center,
  Skeleton,
  Box,
  Tooltip,
  Menu
} from '@mantine/core';
import {
  Heart,
  MessageCircle,
  UserPlus,
  MapPin,
  Share2,
  Star,
  Eye,
  MoreHorizontal,
  RefreshCw as Refresh,
  Filter
} from 'lucide-react';
import { notifications } from '@mantine/notifications';

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'share' | 'bookmark' | 'check_in';
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  target?: {
    id: string;
    type: 'post' | 'user' | 'location';
    title?: string;
    image?: string;
    author?: string;
  };
  content?: string;
  timestamp: Date;
  isFollowing?: boolean;
  metadata?: {
    location?: string;
    tags?: string[];
    stats?: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  showFilters?: boolean;
  maxItems?: number;
  variant?: 'default' | 'compact' | 'detailed';
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  loading = false,
  onLoadMore,
  onRefresh,
  showFilters = false,
  maxItems = 20,
  variant = 'default'
}) => {
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const filtered = activities.filter(activity => {
      if (filter === 'all') return true;
      return activity.type === filter;
    });
    setDisplayedActivities(filtered.slice(0, maxItems));
  }, [activities, filter, maxItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch {
      notifications.show({
        message: '刷新失败，请重试',
        color: 'red'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={16} color="red" />;
      case 'comment':
        return <MessageCircle size={16} color="blue" />;
      case 'follow':
        return <UserPlus size={16} color="green" />;
      case 'post':
        return <Star size={16} color="purple" />;
      case 'share':
        return <Share2 size={16} color="orange" />;
      case 'bookmark':
        return <Star size={16} color="yellow" />;
      case 'check_in':
        return <MapPin size={16} color="teal" />;
      default:
        return <Star size={16} />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const { type, user, target } = activity;
    
    switch (type) {
      case 'like':
        return `${user.name} 点赞了 ${target?.author ? `@${target.author} 的` : ''}帖子`;
      case 'comment':
        return `${user.name} 评论了 ${target?.author ? `@${target.author} 的` : ''}帖子`;
      case 'follow':
        return `${user.name} 关注了 @${target?.title}`;
      case 'post':
        return `${user.name} 发布了新帖子`;
      case 'share':
        return `${user.name} 分享了帖子`;
      case 'bookmark':
        return `${user.name} 收藏了帖子`;
      case 'check_in':
        return `${user.name} 签到了 ${activity.metadata?.location}`;
      default:
        return `${user.name} 进行了活动`;
    }
  };

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
    } else if (days < 30) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const filterOptions = [
    { value: 'all', label: '全部活动' },
    { value: 'like', label: '点赞' },
    { value: 'comment', label: '评论' },
    { value: 'follow', label: '关注' },
    { value: 'post', label: '发帖' },
    { value: 'share', label: '分享' },
    { value: 'bookmark', label: '收藏' },
    { value: 'check_in', label: '签到' }
  ];

  if (loading) {
    return (
      <Stack gap="md">
        {[...Array(5)].map((_, i) => (
          <Paper key={i} p="md" radius="md">
            <Group gap="sm">
              <Skeleton height={40} circle />
              <Stack gap="xs" style={{ flex: 1 }}>
                <Skeleton height={16} width="60%" />
                <Skeleton height={12} width="40%" />
              </Stack>
            </Group>
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="md">
          <Text fw={600} size="lg">活动动态</Text>
          <Badge variant="light" color="blue">
            {displayedActivities.length}
          </Badge>
        </Group>
        
        <Group gap="xs">
          {showFilters && (
            <Menu>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <Filter size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {filterOptions.map(option => (
                  <Menu.Item
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    leftSection={filter === option.value ? <Eye size={14} /> : undefined}
                  >
                    {option.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
          
          <Tooltip label="刷新">
            <ActionIcon
              variant="subtle"
              onClick={handleRefresh}
              loading={refreshing}
            >
              <Refresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Activities */}
      {displayedActivities.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Star size={48} color="var(--mantine-color-gray-4)" />
            <Text c="dimmed" ta="center">
              暂无活动动态
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {displayedActivities.map((activity) => (
            <Paper
              key={activity.id}
              p={variant === 'compact' ? 'sm' : 'md'}
              radius="md"
              style={{
                border: '1px solid var(--mantine-color-gray-2)',
                transition: 'all 0.2s ease'
              }}
            >
              <Group gap="sm" align="flex-start">
                {/* Activity Icon */}
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mantine-color-gray-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Box>
                
                {/* User Avatar */}
                <Avatar
                  src={activity.user.avatar}
                  size={variant === 'compact' ? 'sm' : 'md'}
                  radius="xl"
                  style={{ flexShrink: 0 }}
                />
                
                {/* Content */}
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        {getActivityText(activity)}
                      </Text>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          {formatTime(activity.timestamp)}
                        </Text>
                        {activity.metadata?.location && (
                          <Group gap={2}>
                            <MapPin size={10} />
                            <Text size="xs" c="dimmed">
                              {activity.metadata.location}
                            </Text>
                          </Group>
                        )}
                      </Group>
                    </Stack>
                    
                    <ActionIcon variant="subtle" size="sm">
                      <MoreHorizontal size={14} />
                    </ActionIcon>
                  </Group>
                  
                  {/* Activity Content */}
                  {activity.content && (
                    <Text size="sm" c="dimmed" lineClamp={variant === 'compact' ? 2 : 3}>
                      {activity.content}
                    </Text>
                  )}
                  
                  {/* Target Preview */}
                  {activity.target && variant !== 'compact' && (
                    <Paper
                      p="sm"
                      radius="sm"
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-0)',
                        border: '1px solid var(--mantine-color-gray-2)'
                      }}
                    >
                      <Group gap="sm">
                        {activity.target.image && (
                          <Image
                            src={activity.target.image}
                            alt={activity.target.title}
                            width={40}
                            height={40}
                            radius="sm"
                            style={{ flexShrink: 0 }}
                          />
                        )}
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Text size="sm" fw={500} lineClamp={1}>
                            {activity.target.title}
                          </Text>
                          {activity.target.author && (
                            <Text size="xs" c="dimmed">
                              @{activity.target.author}
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    </Paper>
                  )}
                  
                  {/* Metadata */}
                  {activity.metadata?.tags && activity.metadata.tags.length > 0 && (
                    <Group gap="xs">
                      {activity.metadata.tags.map(tag => (
                        <Badge key={tag} size="xs" variant="light" radius="xl">
                          #{tag}
                        </Badge>
                      ))}
                    </Group>
                  )}
                  
                  {/* Stats */}
                  {activity.metadata?.stats && variant === 'detailed' && (
                    <Group gap="lg">
                      <Group gap={4}>
                        <Heart size={12} />
                        <Text size="xs" c="dimmed">
                          {activity.metadata.stats.likes}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <MessageCircle size={12} />
                        <Text size="xs" c="dimmed">
                          {activity.metadata.stats.comments}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <Share2 size={12} />
                        <Text size="xs" c="dimmed">
                          {activity.metadata.stats.shares}
                        </Text>
                      </Group>
                    </Group>
                  )}
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Load More */}
      {onLoadMore && displayedActivities.length < activities.length && (
        <Center>
          <Button
            variant="subtle"
            onClick={onLoadMore}
            loading={loading}
          >
            加载更多
          </Button>
        </Center>
      )}
    </Stack>
  );
};

export default ActivityFeed;