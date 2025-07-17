import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Video, MoreHorizontal, ArrowLeft, Send, Smile, Image, Paperclip, Mic } from 'lucide-react';
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
    <div className="flex w-full overflow-hidden" style={{ height: 'calc(100vh - 64px)', backgroundColor: 'var(--background-gray)' }}>
      {/* Left Sidebar - Chat List */}
      <div className={`${
        isMobile 
          ? (showChatList ? 'w-full' : 'hidden') 
          : 'w-80 min-w-[320px] max-w-[320px]'
      } bg-white border-r flex flex-col`} style={{ borderColor: 'var(--border-gray)' }}>
        {/* Search Header */}
        <div className="p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border-gray)' }}>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>消息</h1>
            <button className="p-2 rounded-full transition-colors ml-auto" style={{ color: 'var(--primary-blue)' }}>
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="搜索聊天"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ 
                backgroundColor: 'var(--background-gray)',
                borderColor: 'var(--border-gray)'
              } as React.CSSProperties}
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[{ key: 'all', label: '全部' }, { key: 'unread', label: '未读' }, { key: 'groups', label: '群聊' }].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as ChatFilter['type'])}
                className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 flex-shrink-0 ${
                  filter === tab.key
                    ? 'text-white shadow-sm'
                    : 'hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: filter === tab.key ? 'var(--primary-blue)' : 'transparent',
                  color: filter === tab.key ? 'white' : 'var(--text-secondary)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto messages-scrollbar">
          {filteredChats.map(chat => {
            const participant = chat.participants[0];
            const displayName = chat.type === 'group' ? chat.name : participant.name;
            const displayAvatar = chat.type === 'group' ? chat.participants[0].avatar : participant.avatar;
            
            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 border-b cursor-pointer chat-item transition-all duration-200 ${
                  selectedChat?.id === chat.id ? 'active' : ''
                }`}
                style={{ borderColor: 'var(--border-gray)' }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {chat.type === 'direct' && participant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: 'var(--online-green)' }}></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate text-sm" style={{ color: 'var(--text-primary)' }}>{displayName}</h3>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {chat.isTyping ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: 'var(--typing-blue)' }}>正在输入</span>
                            <div className="flex gap-1">
                              <div className="w-1 h-1 rounded-full typing-dot" style={{ backgroundColor: 'var(--typing-blue)' }}></div>
                              <div className="w-1 h-1 rounded-full typing-dot" style={{ backgroundColor: 'var(--typing-blue)' }}></div>
                              <div className="w-1 h-1 rounded-full typing-dot" style={{ backgroundColor: 'var(--typing-blue)' }}></div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {chat.lastMessage?.type === 'image' ? '📷 图片' : chat.lastMessage?.content}
                          </p>
                        )}
                      </div>
                      
                      {/* Unread Badge */}
                      {chat.unreadCount > 0 && (
                        <div className="ml-2 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0" style={{ backgroundColor: 'var(--unread-red)' }}>
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Right Side - Chat Window */}
      <div className={`${
        isMobile 
          ? (showChatList ? 'hidden' : 'w-full') 
          : 'flex-1'
      } flex flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex-shrink-0" style={{ borderColor: 'var(--border-gray)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isMobile && (
                    <button
                      onClick={handleBackToList}
                      className="p-2 rounded-full flex-shrink-0 hover:bg-gray-100 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div className="relative">
                    <img
                      src={selectedChat.type === 'group' ? selectedChat.participants[0].avatar : selectedChat.participants[0].avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    {selectedChat.type === 'direct' && selectedChat.participants[0].isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: 'var(--online-green)' }}></div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {selectedChat.type === 'group' ? selectedChat.name : selectedChat.participants[0].name}
                    </h2>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {selectedChat.type === 'group' 
                        ? `${selectedChat.participants.length} 位成员`
                        : selectedChat.participants[0].isOnline ? '在线' : '离线'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto messages-scrollbar" style={{ padding: '20px' }}>
              {groupMessagesByDate(messages).map(group => (
                <div key={group.date} className="mb-4">
                  {/* Date Separator */}
                  <div className="flex justify-center mb-4">
                    <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--background-gray)', color: 'var(--text-secondary)' }}>
                      {group.date}
                    </span>
                  </div>
                  
                  {/* Messages */}
                  <div className="space-y-1">
                    {group.messages.map((message, index) => {
                      const isMe = message.senderId === 'me';
                      const showAvatar = !isMe && (index === 0 || group.messages[index - 1].senderId !== message.senderId);
                      const isLastInGroup = index === group.messages.length - 1 || group.messages[index + 1].senderId !== message.senderId;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 message-bubble ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isMe && (
                            <div className="w-8 h-8">
                              {showAvatar && (
                                <img
                                  src={selectedChat.participants.find(p => p.id === message.senderId)?.avatar}
                                  alt="avatar"
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'text-white'
                                : 'text-gray-900'
                            } ${
                              isMe
                                ? (isLastInGroup ? 'rounded-br-md' : 'rounded-br-lg')
                                : (isLastInGroup ? 'rounded-bl-md' : 'rounded-bl-lg')
                            }`}
                            style={{
                              backgroundColor: isMe ? 'var(--message-sent)' : 'var(--message-received)'
                            }}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className={`text-xs ${
                                isMe ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                <span className="text-xs text-blue-100 message-status">
                                  {message.status === 'sending' && '发送中'}
                                  {message.status === 'sent' && '已发送'}
                                  {message.status === 'delivered' && '已送达'}
                                  {message.status === 'read' && '已读'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t p-4 flex-shrink-0" style={{ borderColor: 'var(--border-gray)' }}>
              <div className="flex items-end gap-3">
                {/* Toolbar */}
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <Image className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="输入消息..."
                    className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all resize-none message-input"
                    style={{ 
                      backgroundColor: 'var(--background-gray)',
                      color: 'var(--text-primary)'
                    } as React.CSSProperties}
                    rows={1}
                  />
                </div>
                
                {/* Send/Voice Button */}
                {messageInput.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    className="p-2 text-white rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary-blue)' }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--background-gray)' }}>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--message-received)' }}>
                <Search className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>选择一个聊天</h3>
              <p style={{ color: 'var(--text-secondary)' }}>从左侧选择一个聊天开始对话</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;