import React, { useState } from 'react';
import { Button, ActionIcon, Tooltip, Group, Text } from '@mantine/core';
import { UserPlus, UserMinus, UserCheck, Users } from 'lucide-react';
import { notifications } from '@mantine/notifications';

interface FollowButtonProps {
  userId: string;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'subtle' | 'icon';
  showCount?: boolean;
  followerCount?: number;
  onFollow?: (userId: string, isFollowing: boolean) => Promise<void>;
  onSuccess?: (userId: string, isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing = false,
  isFollowedBy = false,
  disabled = false,
  size = 'sm',
  variant = 'filled',
  showCount = false,
  followerCount = 0,
  onFollow,
  onSuccess
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(followerCount);

  const handleFollow = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      const newFollowing = !following;
      
      if (onFollow) {
        await onFollow(userId, newFollowing);
      }
      
      setFollowing(newFollowing);
      setCount(prev => newFollowing ? prev + 1 : Math.max(0, prev - 1));
      
      if (onSuccess) {
        onSuccess(userId, newFollowing);
      }
      
      notifications.show({
        message: newFollowing ? '关注成功！' : '已取消关注',
        color: newFollowing ? 'green' : 'gray',
        icon: newFollowing ? <UserCheck size={16} /> : <UserMinus size={16} />
      });
    } catch {
      notifications.show({
        message: '操作失败，请重试',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (following) {
      return isFollowedBy ? '互相关注' : '已关注';
    }
    return '关注';
  };

  const getButtonColor = () => {
    if (following) {
      return isFollowedBy ? 'green' : 'blue';
    }
    return 'blue';
  };

  const getIcon = () => {
    if (following) {
      return isFollowedBy ? <Users size={16} /> : <UserCheck size={16} />;
    }
    return <UserPlus size={16} />;
  };

  if (variant === 'icon') {
    return (
      <Tooltip label={getButtonText()}>
        <ActionIcon
          variant={following ? 'filled' : 'outline'}
          color={getButtonColor()}
          size={size}
          onClick={handleFollow}
          disabled={disabled}
          loading={loading}
        >
          {getIcon()}
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Group gap="xs">
      <Button
        variant={following ? 'outline' : variant}
        color={getButtonColor()}
        size={size}
        leftSection={getIcon()}
        onClick={handleFollow}
        disabled={disabled}
        loading={loading}
        style={{
          borderStyle: following ? 'dashed' : 'solid'
        }}
      >
        {getButtonText()}
      </Button>
      
      {showCount && (
        <Tooltip label={`${count} 个关注者`}>
          <Group gap={4}>
            <Users size={12} />
            <Text size="xs" c="dimmed">
              {count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}
            </Text>
          </Group>
        </Tooltip>
      )}
    </Group>
  );
};

export default FollowButton;