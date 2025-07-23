import React, { useState } from 'react';
import {
  Card,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Avatar,
  Badge,
  Alert,
  Title,
  Loader
} from '@mantine/core';
import { 
  IconSearch, 
  IconUserPlus, 
  IconMessage, 
  IconX,
  IconUsers
} from '@tabler/icons-react';

interface User {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  bio?: string;
  mutualFriends: number;
  friendStatus: 'none' | 'pending' | 'friends' | 'sent';
}

interface FriendSearchProps {
  onSendFriendRequest: (userId: string) => Promise<void>;
  onCancelFriendRequest: (userId: string) => Promise<void>;
  onSendMessage: (userId: string) => void;
}

const FriendSearch: React.FC<FriendSearchProps> = ({
  onSendFriendRequest,
  onCancelFriendRequest,
  onSendMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Mock search function - replace with actual API call
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results
      const mockResults: User[] = [
        {
          id: '1',
          userId: 'travel_lover_2024',
          displayName: '旅行爱好者',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          isVerified: true,
          bio: '热爱旅行和摄影',
          mutualFriends: 3,
          friendStatus: 'none' as const
        },
        {
          id: '2',
          userId: 'adventure_seeker',
          displayName: '冒险探索者',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          isVerified: false,
          bio: '寻找下一个冒险目的地',
          mutualFriends: 1,
          friendStatus: 'sent' as const
        },
        {
          id: '3',
          userId: 'photo_wanderer',
          displayName: '摄影漫游者',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          isVerified: true,
          bio: '用镜头记录世界',
          mutualFriends: 0,
          friendStatus: 'friends' as const
        }
      ].filter(user => 
        user.userId.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch {
      setError('搜索失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleFriendAction = async (user: User, action: 'add' | 'cancel' | 'message') => {
    setLoadingUserId(user.id);
    
    try {
      switch (action) {
        case 'add':
          await onSendFriendRequest(user.userId);
          // Update local state
          setSearchResults(prev => 
            prev.map(u => 
              u.id === user.id 
                ? { ...u, friendStatus: 'sent' }
                : u
            )
          );
          break;
        case 'cancel':
          await onCancelFriendRequest(user.userId);
          // Update local state
          setSearchResults(prev => 
            prev.map(u => 
              u.id === user.id 
                ? { ...u, friendStatus: 'none' }
                : u
            )
          );
          break;
        case 'message':
          onSendMessage(user.userId);
          break;
      }
    } catch {
      setError('操作失败，请稍后重试');
    } finally {
      setLoadingUserId(null);
    }
  };

  const getFriendActionButton = (user: User) => {
    const isLoading = loadingUserId === user.id;
    
    switch (user.friendStatus) {
      case 'friends':
        return (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconMessage size={14} />}
              onClick={() => handleFriendAction(user, 'message')}
            >
              发消息
            </Button>
            <Badge variant="light" color="green">已是好友</Badge>
          </Group>
        );
      case 'sent':
        return (
          <Button
            size="xs"
            variant="light"
            color="gray"
            leftSection={<IconX size={14} />}
            onClick={() => handleFriendAction(user, 'cancel')}
            loading={isLoading}
          >
            取消请求
          </Button>
        );
      case 'pending':
        return (
          <Badge variant="light" color="orange">待确认</Badge>
        );
      default:
        return (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconUserPlus size={14} />}
            onClick={() => handleFriendAction(user, 'add')}
            loading={isLoading}
          >
            添加好友
          </Button>
        );
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <IconUsers size={20} color="#4682B4" />
          <Title order={4}>搜索好友</Title>
        </Group>
        
        <TextInput
          placeholder="输入用户ID或昵称搜索"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={isSearching ? <Loader size={16} /> : null}
        />
        
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}
        
        {searchResults.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              找到 {searchResults.length} 个用户
            </Text>
            
            {searchResults.map((user) => (
              <Card key={user.id} padding="sm" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <Avatar src={user.avatar} size={40} radius="xl" />
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{user.displayName}</Text>
                        {user.isVerified && (
                          <Badge size="xs" variant="filled" color="blue">✓</Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">@{user.userId}</Text>
                      {user.bio && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {user.bio}
                        </Text>
                      )}
                      {user.mutualFriends > 0 && (
                        <Text size="xs" c="blue">
                          {user.mutualFriends} 个共同好友
                        </Text>
                      )}
                    </Stack>
                  </Group>
                  
                  {getFriendActionButton(user)}
                </Group>
              </Card>
            ))}
          </Stack>
        )}
        
        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            未找到相关用户
          </Text>
        )}
        
        {searchQuery.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            输入用户ID或昵称开始搜索
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default FriendSearch;