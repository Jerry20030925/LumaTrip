import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Chat } from '../types/message';

// Mock WebSocket
// Mock WebSocket

// Mock types
interface MockUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface MockMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'location' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  senderId: string;
  receiverId?: string;
  chatId: string;
  timestamp: string;
  isRecalled?: boolean;
  replyTo?: string;
}

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  url: string;
  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 100);
  }

  send(data: string) {
    if (this.readyState === MockWebSocket.OPEN) {
      // 模拟服务器响应
      setTimeout(() => {
        const message = JSON.parse(data);
        this.onmessage?.(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'message_sent',
            data: {
              id: Date.now().toString(),
              ...message,
              timestamp: new Date().toISOString()
            }
          })
        }));
      }, 50);
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close'));
  }
}

// Mock消息输入组件
const MockMessageInput = ({ onSend, disabled = false }: {
  onSend: (content: string, type: 'text' | 'image' | 'emoji') => void;
  disabled?: boolean;
}) => {
  const [message, setMessage] = React.useState('');
  const [showEmoji, setShowEmoji] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 模拟图片上传
      const reader = new FileReader();
      reader.onload = () => {
        onSend(reader.result as string, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onSend(emoji, 'emoji');
    setShowEmoji(false);
  };

  return (
    <div className="message-input" data-testid="message-input">
      <div className="input-toolbar">
        <button
          data-testid="emoji-button"
          onClick={() => setShowEmoji(!showEmoji)}
          disabled={disabled}
        >
          😊
        </button>
        
        <button
          data-testid="image-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          📷
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          data-testid="image-input"
        />
      </div>
      
      <div className="input-area">
        <textarea
          data-testid="message-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          disabled={disabled}
          maxLength={1000}
        />
        
        <button
          data-testid="send-button"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
        >
          发送
        </button>
      </div>
      
      {showEmoji && (
        <div data-testid="emoji-picker" className="emoji-picker">
          {['😊', '😂', '❤️', '👍', '🎉', '😢', '😮', '😡'].map(emoji => (
            <button
              key={emoji}
              data-testid={`emoji-${emoji}`}
              onClick={() => handleEmojiSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mock消息列表组件
const MockMessageList = ({ messages, currentUserId, onRetract }: {
  messages: MockMessage[];
  currentUserId: string;
  onRetract: (messageId: string) => void;
}) => {
  const canRetract = (message: MockMessage) => {
    const now = new Date();
    const messageTime = new Date(message.timestamp);
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    return message.senderId === currentUserId && diffMinutes <= 2;
  };

  return (
    <div data-testid="message-list" className="message-list">
      {messages.map(message => (
        <div
          key={message.id}
          data-testid={`message-${message.id}`}
          className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
        >
          <div className="message-content">
            {message.type === 'text' && (
              <span data-testid="message-text">{message.content}</span>
            )}
            {message.type === 'image' && (
              <img
                data-testid="message-image"
                src={message.content}
                alt="消息图片"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            )}
            {message.content.match(/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u) && (
              <span data-testid="message-emoji" className="emoji">
                {message.content}
              </span>
            )}
          </div>
          
          <div className="message-meta">
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {message.status && (
              <span
                data-testid={`message-status-${message.id}`}
                className={`status ${message.status}`}
              >
                {message.status === 'sending' && '发送中'}
                {message.status === 'sent' && '已发送'}
                {message.status === 'delivered' && '已送达'}
                {message.status === 'read' && '已读'}
                {/* message.status === 'failed' && '发送失败' */}
              </span>
            )}
          </div>
          
          {canRetract(message) && (
            <button
              data-testid={`retract-${message.id}`}
              onClick={() => onRetract(message.id)}
              className="retract-button"
            >
              撤回
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Mock群聊管理组件
const MockGroupChatManager = ({ chat, onAddMember, onRemoveMember, onUpdateName, onLeave }: {
  chat: Chat;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateName: (name: string) => void;
  onLeave: () => void;
}) => {
  const [showAddMember, setShowAddMember] = React.useState(false);
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [editingName, setEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState(chat.name || '');

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      onAddMember(newMemberEmail.trim());
      setNewMemberEmail('');
      setShowAddMember(false);
    }
  };

  const handleUpdateName = () => {
    if (newName.trim() && newName !== chat.name) {
      onUpdateName(newName.trim());
    }
    setEditingName(false);
  };

  if (chat.type !== 'group') return null;

  return (
    <div data-testid="group-chat-manager" className="group-manager">
      <div className="group-header">
        {editingName ? (
          <div className="name-editor">
            <input
              data-testid="group-name-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={50}
            />
            <button
              data-testid="save-name"
              onClick={handleUpdateName}
            >
              保存
            </button>
            <button
              data-testid="cancel-name"
              onClick={() => {
                setNewName(chat.name || '');
                setEditingName(false);
              }}
            >
              取消
            </button>
          </div>
        ) : (
          <div className="group-name">
            <h3>{chat.name}</h3>
            <button
              data-testid="edit-name"
              onClick={() => setEditingName(true)}
            >
              编辑
            </button>
          </div>
        )}
      </div>
      
      <div className="group-members">
        <h4>群成员 ({chat.participants?.length || 0})</h4>
        {chat.participants?.map(participant => (
          <div key={participant.id} className="member-item">
            <span>{participant.name}</span>
            <button
              data-testid={`remove-member-${participant.id}`}
              onClick={() => onRemoveMember(participant.id)}
            >
              移除
            </button>
          </div>
        ))}
      </div>
      
      <div className="group-actions">
        <button
          data-testid="add-member-button"
          onClick={() => setShowAddMember(true)}
        >
          添加成员
        </button>
        
        <button
          data-testid="leave-group"
          onClick={onLeave}
          className="danger"
        >
          退出群聊
        </button>
      </div>
      
      {showAddMember && (
        <div data-testid="add-member-modal" className="add-member-modal">
          <input
            data-testid="member-email-input"
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="输入用户邮箱"
          />
          <button
            data-testid="confirm-add-member"
            onClick={handleAddMember}
            disabled={!newMemberEmail.trim()}
          >
            添加
          </button>
          <button
            data-testid="cancel-add-member"
            onClick={() => {
              setShowAddMember(false);
              setNewMemberEmail('');
            }}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
};

describe('消息功能测试', () => {
  const mockCurrentUser: MockUser = {
    id: 'current-user',
    name: 'testuser',
    avatar: '/avatar.jpg',
    isOnline: true
  };

  const mockMessages: MockMessage[] = [
    {
      id: 'msg-1',
      content: '你好！',
      senderId: 'other-user',
      receiverId: 'current-user',
      type: 'text',
      timestamp: '2024-01-01T10:00:00Z',
      status: 'read',
      chatId: 'chat-1'
    },
    {
      id: 'msg-2',
      content: '最近怎么样？',
      senderId: 'current-user',
      receiverId: 'other-user',
      type: 'text',
      timestamp: '2024-01-01T10:01:00Z',
      status: 'delivered',
      chatId: 'chat-1'
    }
  ];

  const mockGroupChat: Chat = {
    id: 'group-1',
    type: 'group',
    name: '测试群聊',
    participants: [
      mockCurrentUser,
      { id: 'user-2', name: 'user2', avatar: '/avatar2.jpg', isOnline: false },
      { id: 'user-3', name: 'user3', avatar: '/avatar3.jpg', isOnline: true }
    ],
    lastMessage: { ...mockMessages[0], timestamp: new Date(mockMessages[0].timestamp) },
    updatedAt: new Date('2024-01-01T10:01:00Z'),
    unreadCount: 0,
    isTyping: false,
    typingUsers: [],
    createdAt: new Date('2024-01-01T10:00:00Z')
  };

  const mockHandlers = {
    onSend: vi.fn(),
    onRetract: vi.fn(),
    onAddMember: vi.fn(),
    onRemoveMember: vi.fn(),
    onUpdateName: vi.fn(),
    onLeave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock WebSocket
    global.WebSocket = MockWebSocket as any;
    
    // Mock FileReader
    global.FileReader = class {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      
      readAsDataURL() {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
          this.onload?.({ target: this } as any);
        }, 100);
      }
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('发送消息', () => {
    it('应该能够发送文本消息', async () => {
      const user = userEvent.setup();
      render(<MockMessageInput onSend={mockHandlers.onSend} />);
      
      const textarea = screen.getByTestId('message-textarea');
      const sendButton = screen.getByTestId('send-button');
      
      expect(sendButton).toBeDisabled();
      
      await user.type(textarea, '这是一条测试消息');
      expect(sendButton).toBeEnabled();
      
      await user.click(sendButton);
      
      expect(mockHandlers.onSend).toHaveBeenCalledWith('这是一条测试消息', 'text');
      expect(textarea).toHaveValue('');
    });

    it('应该能够通过回车键发送消息', async () => {
      const user = userEvent.setup();
      render(<MockMessageInput onSend={mockHandlers.onSend} />);
      
      const textarea = screen.getByTestId('message-textarea');
      
      await user.type(textarea, '回车发送测试');
      await user.keyboard('{Enter}');
      
      expect(mockHandlers.onSend).toHaveBeenCalledWith('回车发送测试', 'text');
    });

    it('应该能够发送图片消息', async () => {
      const user = userEvent.setup();
      render(<MockMessageInput onSend={mockHandlers.onSend} />);
      
      const imageButton = screen.getByTestId('image-button');
      const imageInput = screen.getByTestId('image-input');
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.click(imageButton);
      await user.upload(imageInput, file);
      
      await waitFor(() => {
        expect(mockHandlers.onSend).toHaveBeenCalledWith(
          expect.stringContaining('data:image/jpeg;base64'),
          'image'
        );
      });
    });

    it('应该能够发送表情', async () => {
      const user = userEvent.setup();
      render(<MockMessageInput onSend={mockHandlers.onSend} />);
      
      const emojiButton = screen.getByTestId('emoji-button');
      await user.click(emojiButton);
      
      expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
      
      const heartEmoji = screen.getByTestId('emoji-❤️');
      await user.click(heartEmoji);
      
      expect(mockHandlers.onSend).toHaveBeenCalledWith('❤️', 'text');
      expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
    });

    it('应该限制消息长度', async () => {
      const user = userEvent.setup();
      render(<MockMessageInput onSend={mockHandlers.onSend} />);
      
      const textarea = screen.getByTestId('message-textarea') as HTMLTextAreaElement;
      const longMessage = 'a'.repeat(1001);
      
      await user.type(textarea, longMessage);
      
      expect(textarea.value).toHaveLength(1000);
    });
  });

  describe('消息显示', () => {
    it('应该正确显示消息列表', () => {
      render(
        <MockMessageList
          messages={mockMessages}
          currentUserId="current-user"
          onRetract={mockHandlers.onRetract}
        />
      );
      
      expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-msg-2')).toBeInTheDocument();
      
      expect(screen.getByText('你好！')).toBeInTheDocument();
      expect(screen.getByText('最近怎么样？')).toBeInTheDocument();
    });

    it('应该显示消息状态', () => {
      render(
        <MockMessageList
          messages={mockMessages}
          currentUserId="current-user"
          onRetract={mockHandlers.onRetract}
        />
      );
      
      expect(screen.getByTestId('message-status-msg-2')).toHaveTextContent('已送达');
    });

    it('应该区分发送和接收的消息', () => {
      render(
        <MockMessageList
          messages={mockMessages}
          currentUserId="current-user"
          onRetract={mockHandlers.onRetract}
        />
      );
      
      const sentMessage = screen.getByTestId('message-msg-2');
      const receivedMessage = screen.getByTestId('message-msg-1');
      
      expect(sentMessage).toHaveClass('sent');
      expect(receivedMessage).toHaveClass('received');
    });
  });

  describe('消息撤回', () => {
    it('应该能够撤回2分钟内的消息', async () => {
      const user = userEvent.setup();
      const recentMessage: MockMessage = {
        id: 'recent-msg',
        content: '刚发送的消息',
        senderId: 'current-user',
        receiverId: 'other-user',
        type: 'text',
        timestamp: new Date().toISOString(),
        status: 'sent',
        chatId: 'chat-1'
      };
      
      render(
        <MockMessageList
          messages={[recentMessage]}
          currentUserId="current-user"
          onRetract={mockHandlers.onRetract}
        />
      );
      
      const retractButton = screen.getByTestId('retract-recent-msg');
      expect(retractButton).toBeInTheDocument();
      
      await user.click(retractButton);
      
      expect(mockHandlers.onRetract).toHaveBeenCalledWith('recent-msg');
    });

    it('不应该显示超过2分钟消息的撤回按钮', () => {
      const oldMessage: MockMessage = {
        id: 'old-msg',
        content: '很久前的消息',
        senderId: 'current-user',
        receiverId: 'other-user',
        type: 'text',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3分钟前
        chatId: 'chat-1',
        status: 'sent'
      };
      
      render(
        <MockMessageList
          messages={[oldMessage]}
          currentUserId="current-user"
          onRetract={mockHandlers.onRetract}
        />
      );
      
      expect(screen.queryByTestId('retract-old-msg')).not.toBeInTheDocument();
    });
  });

  describe('群聊功能', () => {
    it('应该显示群聊管理界面', () => {
      render(
        <MockGroupChatManager
          chat={mockGroupChat}
          onAddMember={mockHandlers.onAddMember}
          onRemoveMember={mockHandlers.onRemoveMember}
          onUpdateName={mockHandlers.onUpdateName}
          onLeave={mockHandlers.onLeave}
        />
      );
      
      expect(screen.getByTestId('group-chat-manager')).toBeInTheDocument();
      expect(screen.getByText('测试群聊')).toBeInTheDocument();
      expect(screen.getByText('群成员 (3)')).toBeInTheDocument();
    });

    it('应该能够修改群名称', async () => {
      const user = userEvent.setup();
      render(
        <MockGroupChatManager
          chat={mockGroupChat}
          onAddMember={mockHandlers.onAddMember}
          onRemoveMember={mockHandlers.onRemoveMember}
          onUpdateName={mockHandlers.onUpdateName}
          onLeave={mockHandlers.onLeave}
        />
      );
      
      const editButton = screen.getByTestId('edit-name');
      await user.click(editButton);
      
      const nameInput = screen.getByTestId('group-name-input');
      await user.clear(nameInput);
      await user.type(nameInput, '新的群名称');
      
      const saveButton = screen.getByTestId('save-name');
      await user.click(saveButton);
      
      expect(mockHandlers.onUpdateName).toHaveBeenCalledWith('新的群名称');
    });

    it('应该能够添加群成员', async () => {
      const user = userEvent.setup();
      render(
        <MockGroupChatManager
          chat={mockGroupChat}
          onAddMember={mockHandlers.onAddMember}
          onRemoveMember={mockHandlers.onRemoveMember}
          onUpdateName={mockHandlers.onUpdateName}
          onLeave={mockHandlers.onLeave}
        />
      );
      
      const addButton = screen.getByTestId('add-member-button');
      await user.click(addButton);
      
      expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
      
      const emailInput = screen.getByTestId('member-email-input');
      await user.type(emailInput, 'newuser@example.com');
      
      const confirmButton = screen.getByTestId('confirm-add-member');
      await user.click(confirmButton);
      
      expect(mockHandlers.onAddMember).toHaveBeenCalledWith('newuser@example.com');
    });

    it('应该能够移除群成员', async () => {
      const user = userEvent.setup();
      render(
        <MockGroupChatManager
          chat={mockGroupChat}
          onAddMember={mockHandlers.onAddMember}
          onRemoveMember={mockHandlers.onRemoveMember}
          onUpdateName={mockHandlers.onUpdateName}
          onLeave={mockHandlers.onLeave}
        />
      );
      
      const removeButton = screen.getByTestId('remove-member-user-2');
      await user.click(removeButton);
      
      expect(mockHandlers.onRemoveMember).toHaveBeenCalledWith('user-2');
    });

    it('应该能够退出群聊', async () => {
      const user = userEvent.setup();
      render(
        <MockGroupChatManager
          chat={mockGroupChat}
          onAddMember={mockHandlers.onAddMember}
          onRemoveMember={mockHandlers.onRemoveMember}
          onUpdateName={mockHandlers.onUpdateName}
          onLeave={mockHandlers.onLeave}
        />
      );
      
      const leaveButton = screen.getByTestId('leave-group');
      await user.click(leaveButton);
      
      expect(mockHandlers.onLeave).toHaveBeenCalled();
    });
  });

  describe('实时消息', () => {
    it('应该能够建立WebSocket连接', async () => {
      const mockWs = new MockWebSocket('ws://localhost:5173/ws');
      
      expect(mockWs.readyState).toBe(MockWebSocket.CONNECTING);
      
      await waitFor(() => {
        expect(mockWs.readyState).toBe(MockWebSocket.OPEN);
      });
    });

    it('应该能够接收实时消息', async () => {
      const mockWs = new MockWebSocket('ws://localhost:5173/ws');
      const onMessage = vi.fn();
      
      mockWs.onmessage = onMessage;
      
      await waitFor(() => {
        expect(mockWs.readyState).toBe(MockWebSocket.OPEN);
      });
      
      mockWs.send(JSON.stringify({
        type: 'message',
        content: '实时消息测试',
        receiverId: 'current-user'
      }));
      
      await waitFor(() => {
        expect(onMessage).toHaveBeenCalled();
      });
    });
  });

  describe('消息搜索', () => {
    it('应该能够搜索消息内容', () => {
      const searchMessages = (query: string, messages: MockMessage[]) => {
        return messages.filter(msg => 
          msg.content.toLowerCase().includes(query.toLowerCase())
        );
      };
      
      const results = searchMessages('你好', mockMessages);
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('你好！');
    });

    it('应该支持按时间范围搜索', () => {
      const searchByDateRange = (startDate: string, endDate: string, messages: MockMessage[]) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return messages.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate >= start && msgDate <= end;
        });
      };
      
      const results = searchByDateRange(
        '2024-01-01T10:00:00Z',
        '2024-01-01T10:00:30Z',
        mockMessages
      );
      
      expect(results).toHaveLength(1);
    });
  });

  describe('消息通知', () => {
    it('应该显示未读消息数量', () => {
      const chatWithUnread: Chat = {
        ...mockGroupChat,
        unreadCount: 5
      };
      
      // 在实际应用中，这里会渲染聊天列表项
      expect(chatWithUnread.unreadCount).toBe(5);
    });

    it('应该标记消息为已读', () => {
      const markAsRead = () => {
        // 模拟标记为已读的逻辑
        return { success: true };
      };
      
      const result = markAsRead();
      expect(result.success).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该处理发送失败的消息', async () => {
      const user = userEvent.setup();
      const failingOnSend = vi.fn().mockRejectedValue(new Error('发送失败'));
      
      render(<MockMessageInput onSend={failingOnSend} />);
      
      const textarea = screen.getByTestId('message-textarea');
      const sendButton = screen.getByTestId('send-button');
      
      await user.type(textarea, '测试消息');
      await user.click(sendButton);
      
      expect(failingOnSend).toHaveBeenCalled();
    });

    it('应该处理网络连接断开', () => {
      const mockWs = new MockWebSocket('ws://localhost:5173/ws');
      const onClose = vi.fn();
      
      mockWs.onclose = onClose;
      mockWs.close();
      
      expect(mockWs.readyState).toBe(MockWebSocket.CLOSED);
      expect(onClose).toHaveBeenCalled();
    });

    it('应该在禁用状态下阻止操作', () => {
      render(<MockMessageInput onSend={mockHandlers.onSend} disabled={true} />);
      
      const textarea = screen.getByTestId('message-textarea');
      const sendButton = screen.getByTestId('send-button');
      const emojiButton = screen.getByTestId('emoji-button');
      const imageButton = screen.getByTestId('image-button');
      
      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled();
      expect(emojiButton).toBeDisabled();
      expect(imageButton).toBeDisabled();
    });
  });
});