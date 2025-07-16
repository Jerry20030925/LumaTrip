import React, { useState, useRef, useEffect } from 'react';
import { Reply, Copy, Forward, Trash2, RotateCcw } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'voice' | 'location' | 'system';
  };
  isMe: boolean;
  showAvatar: boolean;
  avatarUrl?: string;
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onRecall?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  showAvatar,
  avatarUrl,
  onReply,
  onDelete,
  onForward,
  onRecall
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Long press handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setShowContextMenu(true);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;
    
    // If moved too much, cancel long press
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        setIsLongPressing(false);
      }
    }
    
    // Handle swipe for reply
    if (Math.abs(deltaX) > 20 && Math.abs(deltaY) < 50) {
      const direction = deltaX > 0 ? 'right' : 'left';
      const shouldSwipe = isMe ? direction === 'left' : direction === 'right';
      
      if (shouldSwipe) {
        setSwipeOffset(Math.max(0, Math.min(50, Math.abs(deltaX))));
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPressing(false);
    
    // Auto-reply on swipe
    if (swipeOffset > 30 && onReply) {
      onReply(message.id);
    }
    
    setSwipeOffset(0);
  };

  // Desktop long press
  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setShowContextMenu(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowContextMenu(false);
  };

  const handleReply = () => {
    onReply?.(message.id);
    setShowContextMenu(false);
  };

  const handleForward = () => {
    onForward?.(message.id);
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowContextMenu(false);
  };

  const handleRecall = () => {
    onRecall?.(message.id);
    setShowContextMenu(false);
  };

  const canRecall = isMe && (Date.now() - message.timestamp.getTime()) < 2 * 60 * 1000; // 2 minutes

  return (
    <div
      className={`flex items-end gap-2 message-bubble ${
        isMe ? 'justify-end' : 'justify-start'
      }`}
      style={{
        transform: `translateX(${isMe ? -swipeOffset : swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.2s ease' : 'none'
      }}
    >
      {!isMe && (
        <div className="w-8 h-8">
          {showAvatar && avatarUrl && (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
        </div>
      )}
      
      <div className="relative">
        <div
          ref={bubbleRef}
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
            isMe
              ? 'text-white rounded-br-md'
              : 'text-gray-900 rounded-bl-md'
          } ${isLongPressing ? 'scale-105' : ''}`}
          style={{
            backgroundColor: isMe ? 'var(--message-sent)' : 'var(--message-received)',
            transition: 'transform 0.1s ease'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
              <span className="text-xs text-blue-100">
                {message.status === 'sending' && '发送中'}
                {message.status === 'sent' && '已发送'}
                {message.status === 'delivered' && '已送达'}
                {message.status === 'read' && '已读'}
              </span>
            )}
          </div>
        </div>

        {/* Context Menu */}
        {showContextMenu && (
          <div
            ref={contextMenuRef}
            className={`absolute z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] ${
              isMe ? 'right-0 top-0' : 'left-0 top-0'
            }`}
            style={{
              borderColor: 'var(--border-gray)',
              transform: 'translateY(-100%)'
            }}
          >
            <button
              onClick={handleReply}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Reply className="w-4 h-4" />
              回复
            </button>
            <button
              onClick={handleCopy}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
            <button
              onClick={handleForward}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Forward className="w-4 h-4" />
              转发
            </button>
            {canRecall && (
              <button
                onClick={handleRecall}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                style={{ color: 'var(--primary-blue)' }}
              >
                <RotateCcw className="w-4 h-4" />
                撤回
              </button>
            )}
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        )}
      </div>

      {/* Swipe Reply Indicator */}
      {swipeOffset > 10 && (
        <div className={`absolute top-1/2 transform -translate-y-1/2 ${
          isMe ? 'right-full mr-2' : 'left-full ml-2'
        }`}>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Reply className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;