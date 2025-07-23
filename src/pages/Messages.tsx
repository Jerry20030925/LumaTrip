import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Video, MoreHorizontal, ArrowLeft, Send, Smile, Image, Paperclip, Mic } from 'lucide-react';
import {
  Container,
  Paper,
  Group,
  Stack,
  Text,
  TextInput,
  Button,
  ActionIcon,
  Avatar,
  Badge,
  Textarea,
  ScrollArea,
  Indicator,
  Menu,
  Title,
  Box,
  Card,
  Flex
} from '@mantine/core';
import type { Chat, Message, User, ChatFilter, MessageGroup } from '../types/message';

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ChatFilter['type']>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      { id: '1', name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', isOnline: true },
      { id: '2', name: '李四', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face', isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
      { id: '3', name: '王五', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', isOnline: true },
      { id: '4', name: '旅行群', avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=40&h=40&fit=crop&crop=face', isOnline: true }
    ];

    const mockChats: Chat[] = [
      {
        id: '1',
        type: 'direct',
        participants: [mockUsers[0]],
        lastMessage: {
          id: '1',
          content: '今天的旅行计划怎么样？',
          senderId: '1',
          chatId: '1',
          timestamp: new Date(Date.now() - 300000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 2,
        isTyping: false,
        typingUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        type: 'direct',
        participants: [mockUsers[1]],
        lastMessage: {
          id: '2',
          content: '好的，明天见！',
          senderId: 'me',
          chatId: '2',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
          status: 'delivered'
        },
        unreadCount: 0,
        isTyping: false,
        typingUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        type: 'direct',
        participants: [mockUsers[2]],
        lastMessage: {
          id: '3',
          content: '分享了一张照片',
          senderId: '3',
          chatId: '3',
          timestamp: new Date(Date.now() - 7200000),
          type: 'image',
          status: 'read'
        },
        unreadCount: 1,
        isTyping: true,
        typingUsers: ['3'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        type: 'group',
        name: '旅行群',
        participants: mockUsers,
        lastMessage: {
          id: '4',
          content: '大家准备好了吗？',
          senderId: '4',
          chatId: '4',
          timestamp: new Date(Date.now() - 86400000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 5,
        isTyping: false,
        typingUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setChats(mockChats);
  }, []);

  // Mock messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      const mockMessages: Message[] = [
        {
          id: '1',
          content: '你好！最近怎么样？',
          senderId: selectedChat.participants[0].id,
          chatId: selectedChat.id,
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          content: '很好！你呢？准备去哪里旅行？',
          senderId: 'me',
          chatId: selectedChat.id,
          timestamp: new Date(Date.now() - 3300000),
          type: 'text',
          status: 'read'
        },
        {
          id: '3',
          content: '我在考虑去日本，你有什么推荐的地方吗？',
          senderId: selectedChat.participants[0].id,
          chatId: selectedChat.id,
          timestamp: new Date(Date.now() - 3000000),
          type: 'text',
          status: 'read'
        },
        {
          id: '4',
          content: '京都和大阪都很不错！特别是春天的樱花季。',
          senderId: 'me',
          chatId: selectedChat.id,
          timestamp: new Date(Date.now() - 2700000),
          type: 'text',
          status: 'read'
        },
        {
          id: '5',
          content: '今天的旅行计划怎么样？',
          senderId: selectedChat.participants[0].id,
          chatId: selectedChat.id,
          timestamp: new Date(Date.now() - 300000),
          type: 'text',
          status: 'delivered'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedChat]);

  // Responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || (chat.name && chat.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && chat.unreadCount > 0) ||
      (filter === 'groups' && chat.type === 'group');
    
    return matchesSearch && matchesFilter;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = message.timestamp.toLocaleDateString('zh-CN');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({ date, messages }));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      senderId: 'me',
      chatId: selectedChat.id,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    
    // Simulate message sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  return (
    <Container size="xl" px={0} style={{ height: 'calc(100vh - 64px)' }}>
      <Group align="stretch" gap={0} style={{ height: '100%' }}>
        {/* Left Sidebar - Chat List */}
        <Paper
          shadow="sm"
          radius={0}
          style={{
            width: isMobile ? (showChatList ? '100%' : '0') : '320px',
            minWidth: isMobile ? (showChatList ? '100%' : '0') : '320px',
            display: isMobile && !showChatList ? 'none' : 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRight: '1px solid var(--mantine-color-gray-3)'
          }}
        >
          {/* Search Header */}
          <Stack p="md" gap="sm">
            <Group justify="space-between" align="center">
              <Title order={3} size="lg">消息</Title>
              <ActionIcon variant="subtle" color="blue">
                <Plus size={20} />
              </ActionIcon>
            </Group>
            
            <TextInput
              placeholder="搜索聊天"
              leftSection={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              radius="lg"
              size="sm"
            />
            
            {/* Filter Tabs */}
            <Group gap="xs">
              {[{ key: 'all', label: '全部' }, { key: 'unread', label: '未读' }, { key: 'groups', label: '群聊' }].map(tab => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? 'filled' : 'subtle'}
                  size="xs"
                  radius="xl"
                  onClick={() => setFilter(tab.key as ChatFilter['type'])}
                >
                  {tab.label}
                </Button>
              ))}
            </Group>
          </Stack>
          
          {/* Chat List */}
          <ScrollArea style={{ flex: 1 }}>
            <Stack gap={0}>
              {filteredChats.map(chat => {
                const participant = chat.participants[0];
                const displayName = chat.type === 'group' ? chat.name : participant.name;
                const displayAvatar = chat.type === 'group' ? chat.participants[0].avatar : participant.avatar;
                
                return (
                  <Card
                    key={chat.id}
                    p="md"
                    radius={0}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--mantine-color-gray-2)',
                      backgroundColor: selectedChat?.id === chat.id ? 'var(--mantine-color-blue-0)' : 'transparent'
                    }}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <Group gap="sm" align="flex-start">
                      {/* Avatar */}
                      {chat.type === 'direct' && participant?.isOnline ? (
                        <Indicator inline size={10} offset={7} position="bottom-end" color="green">
                          <Avatar src={displayAvatar} size="md" radius="xl" />
                        </Indicator>
                      ) : (
                        <Avatar src={displayAvatar} size="md" radius="xl" />
                      )}
                      
                      {/* Content */}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="space-between" mb={4}>
                          <Text fw={500} size="sm" truncate style={{ flex: 1 }}>
                            {displayName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                          </Text>
                        </Group>
                        
                        <Group justify="space-between" align="center">
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            {chat.isTyping ? (
                              <Group gap={4} align="center">
                                <Text size="xs" c="blue">正在输入</Text>
                                <Text size="xs" c="blue">...</Text>
                              </Group>
                            ) : (
                              <Text size="xs" c="dimmed" truncate>
                                {chat.lastMessage?.type === 'image' ? '📷 图片' : chat.lastMessage?.content}
                              </Text>
                            )}
                          </Box>
                          
                          {/* Unread Badge */}
                          {chat.unreadCount > 0 && (
                            <Badge size="sm" variant="filled" color="red" radius="xl">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Badge>
                          )}
                        </Group>
                      </Box>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </ScrollArea>
        </Paper>
        
        {/* Right Side - Chat Window */}
        <Paper
          shadow="sm"
          radius={0}
          style={{
            flex: 1,
            display: isMobile && showChatList ? 'none' : 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <Paper p="md" radius={0} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Group justify="space-between" align="center">
                  <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    {isMobile && (
                      <ActionIcon
                        variant="subtle"
                        onClick={handleBackToList}
                      >
                        <ArrowLeft size={20} />
                      </ActionIcon>
                    )}
                    
                    {selectedChat.type === 'direct' && selectedChat.participants[0].isOnline ? (
                      <Indicator inline size={10} offset={7} position="bottom-end" color="green">
                        <Avatar
                          src={selectedChat.participants[0].avatar}
                          size="md"
                          radius="xl"
                        />
                      </Indicator>
                    ) : (
                      <Avatar
                        src={selectedChat.participants[0].avatar}
                        size="md"
                        radius="xl"
                      />
                    )}
                    
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={500} size="sm" truncate>
                        {selectedChat.type === 'group' ? selectedChat.name : selectedChat.participants[0].name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {selectedChat.type === 'group' 
                          ? `${selectedChat.participants.length} 位成员`
                          : selectedChat.participants[0].isOnline ? '在线' : '离线'
                        }
                      </Text>
                    </Box>
                  </Group>
                  
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <Phone size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <Video size={18} />
                    </ActionIcon>
                    <Menu>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <MoreHorizontal size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item>查看资料</Menu.Item>
                        <Menu.Item>静音通知</Menu.Item>
                        <Menu.Item color="red">删除聊天</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>
              </Paper>
              
              {/* Messages Area */}
              <ScrollArea style={{ flex: 1 }} p="md">
                <Stack gap="md">
                  {groupMessagesByDate(messages).map(group => (
                    <Stack key={group.date} gap="xs">
                      {/* Date Separator */}
                      <Group justify="center">
                        <Badge variant="light" color="gray" radius="xl" size="sm">
                          {group.date}
                        </Badge>
                      </Group>
                      
                      {/* Messages */}
                      <Stack gap={2}>
                        {group.messages.map((message, index) => {
                          const isMe = message.senderId === 'me';
                          const showAvatar = !isMe && (index === 0 || group.messages[index - 1].senderId !== message.senderId);
                          const isLastInGroup = index === group.messages.length - 1 || group.messages[index + 1].senderId !== message.senderId;
                          
                          return (
                            <Group
                              key={message.id}
                              gap="xs"
                              align="end"
                              justify={isMe ? 'flex-end' : 'flex-start'}
                            >
                              {!isMe && (
                                <Box w={32} h={32}>
                                  {showAvatar && (
                                    <Avatar
                                      src={selectedChat.participants.find(p => p.id === message.senderId)?.avatar}
                                      size={32}
                                      radius="xl"
                                    />
                                  )}
                                </Box>
                              )}
                              
                              <Paper
                                p="sm"
                                radius={isMe ? (isLastInGroup ? 'lg' : 'lg') : (isLastInGroup ? 'lg' : 'lg')}
                                style={{
                                  maxWidth: '320px',
                                  backgroundColor: isMe ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-1)',
                                  color: isMe ? 'white' : 'var(--mantine-color-dark-7)',
                                  borderBottomRightRadius: isMe && isLastInGroup ? '4px' : undefined,
                                  borderBottomLeftRadius: !isMe && isLastInGroup ? '4px' : undefined
                                }}
                              >
                                <Text size="sm">{message.content}</Text>
                                <Group gap={4} justify={isMe ? 'flex-end' : 'flex-start'} mt={2}>
                                  <Text
                                    size="xs"
                                    c={isMe ? 'blue.1' : 'dimmed'}
                                  >
                                    {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                  {isMe && (
                                    <Text size="xs" c="blue.1">
                                      {message.status === 'sending' && '发送中'}
                                      {message.status === 'sent' && '已发送'}
                                      {message.status === 'delivered' && '已送达'}
                                      {message.status === 'read' && '已读'}
                                    </Text>
                                  )}
                                </Group>
                              </Paper>
                            </Group>
                          );
                        })}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </ScrollArea>
              
              {/* Message Input */}
              <Paper p="md" radius={0} style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <Group align="end" gap="sm">
                  {/* Toolbar */}
                  <Group gap={4}>
                    <ActionIcon variant="subtle">
                      <Smile size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <Image size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <Paperclip size={18} />
                    </ActionIcon>
                  </Group>
                  
                  {/* Input */}
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入消息..."
                    radius="xl"
                    size="sm"
                    autosize
                    minRows={1}
                    maxRows={4}
                    style={{ flex: 1 }}
                  />
                  
                  {/* Send/Voice Button */}
                  {messageInput.trim() ? (
                    <ActionIcon
                      variant="filled"
                      size="lg"
                      radius="xl"
                      onClick={handleSendMessage}
                    >
                      <Send size={18} />
                    </ActionIcon>
                  ) : (
                    <ActionIcon variant="subtle" size="lg" radius="xl">
                      <Mic size={18} />
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            </>
          ) : (
            /* No Chat Selected */
            <Flex direction="column" justify="center" align="center" style={{ flex: 1 }}>
              <Stack align="center" gap="md">
                <Avatar size={96} radius="xl" color="gray">
                  <Search size={48} />
                </Avatar>
                <Stack align="center" gap="xs">
                  <Title order={3} ta="center">选择一个聊天</Title>
                  <Text c="dimmed" ta="center">从左侧选择一个聊天开始对话</Text>
                </Stack>
              </Stack>
            </Flex>
          )}
        </Paper>
      </Group>
    </Container>
  );
};

export default Messages;