export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  chatId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'voice' | 'location' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  attachments?: {
    type: 'image' | 'file' | 'voice';
    url: string;
    name?: string;
    size?: number;
    duration?: number; // for voice messages
  }[];
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string; // for group chats
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping: boolean;
  typingUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatFilter {
  type: 'all' | 'unread' | 'groups';
}

export interface MessageGroup {
  date: string;
  messages: Message[];
}