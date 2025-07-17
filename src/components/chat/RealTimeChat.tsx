import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Conversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'direct' | 'group';
  name?: string;
}

interface RealTimeChatProps {
  currentUserId: string;
  onClose?: () => void;
  initialConversationId?: string;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({
  currentUserId,
  onClose,
  initialConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          {
            id: '2',
            name: '张小明',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
            isOnline: true
          }
        ],
        lastMessage: {
          id: '1',
          senderId: '2',
          senderName: '张小明',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          content: '你好！最近怎么样？',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'text',
          isRead: false
        },
        unreadCount: 2,
        type: 'direct'
      },
      {
        id: '2',
        participants: [
          {
            id: '3',
            name: '李小红',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
            isOnline: false,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        lastMessage: {
          id: '2',
          senderId: '3',
          senderName: '李小红',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
          content: '好的，明天见！',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          isRead: true
        },
        unreadCount: 0,
        type: 'direct'
      },
      {
        id: '3',
        participants: [
          {
            id: '4',
            name: '王摄影',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
            isOnline: true
          },
          {
            id: '5',
            name: '陈小美',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
            isOnline: false
          }
        ],
        name: '旅行摄影交流群',
        lastMessage: {
          id: '3',
          senderId: '4',
          senderName: '王摄影',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
          content: '大家有空可以一起出去拍照',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          type: 'text',
          isRead: true
        },
        unreadCount: 1,
        type: 'group'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: '2',
        senderName: '张小明',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        content: '你好！最近怎么样？',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'text',
        isRead: false
      },
      {
        id: '2',
        senderId: currentUserId,
        senderName: '我',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        content: '很好啊，你呢？',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        type: 'text',
        isRead: true
      },
      {
        id: '3',
        senderId: '2',
        senderName: '张小明',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        content: '我也很好，有空一起出去旅行吧！',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text',
        isRead: false
      }
    ];

    setConversations(mockConversations);
    if (initialConversationId) {
      setMessages(mockMessages);
    }

    // Check for mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [currentUserId, initialConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: '我',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
        isRead: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, lastMessage: message }
          : conv
      ));
      
      // Simulate typing indicator
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            senderId: '2',
            senderName: '张小明',
            senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
            content: '收到！',
            timestamp: new Date(),
            type: 'text',
            isRead: false
          };
          setMessages(prev => [...prev, replyMessage]);
        }, 1000);
      }, 500);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    if (isMobile) {
      setShowChatList(false);
    }
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚在线';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前在线`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前在线`;
    return `${Math.floor(diffInMinutes / 1440)}天前在线`;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return conv.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
           conv.name?.toLowerCase().includes(searchLower) ||
           conv.lastMessage?.content.toLowerCase().includes(searchLower);
  });

  const currentConversation = conversations.find(conv => conv.id === activeConversation);

  return (
    <div className="flex h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Chat List */}
      <AnimatePresence>
        {(showChatList || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: '-100%' } : undefined}
            animate={{ x: 0 }}
            exit={isMobile ? { x: '-100%' } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${isMobile ? 'absolute inset-0 z-10' : 'w-80'} bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col`}
          >
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">消息</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
              
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <input
                    type="text"
                    placeholder="搜索对话..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </motion.div>
              )}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    activeConversation === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="relative">
                    {conversation.type === 'direct' ? (
                      <img
                        src={conversation.participants[0].avatar}
                        alt={conversation.participants[0].name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {conversation.name?.charAt(0) || 'G'}
                        </span>
                      </div>
                    )}
                    
                    {conversation.type === 'direct' && conversation.participants[0].isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.name || conversation.participants[0].name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage?.content || '暂无消息'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      {activeConversation && currentConversation && (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button
                    onClick={() => setShowChatList(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                
                <div className="relative">
                  {currentConversation.type === 'direct' ? (
                    <img
                      src={currentConversation.participants[0].avatar}
                      alt={currentConversation.participants[0].name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {currentConversation.name?.charAt(0) || 'G'}
                      </span>
                    </div>
                  )}
                  
                  {currentConversation.type === 'direct' && currentConversation.participants[0].isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {currentConversation.name || currentConversation.participants[0].name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentConversation.type === 'direct' ? (
                      currentConversation.participants[0].isOnline ? '在线' : 
                      currentConversation.participants[0].lastSeen ? 
                      formatLastSeen(currentConversation.participants[0].lastSeen) : '离线'
                    ) : (
                      `${currentConversation.participants.length} 位成员`
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Phone className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Video className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.senderId === currentUserId ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    message.senderId === currentUserId 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${
                    message.senderId === currentUserId ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {message.senderId !== currentUserId && (
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover mr-2 order-0"
                  />
                )}
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">正在输入...</span>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入消息..."
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <Smile className="w-4 h-4 text-gray-500" />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!activeConversation && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">选择一个对话</h3>
            <p className="text-gray-500 dark:text-gray-400">从左侧列表中选择一个对话开始聊天</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeChat;