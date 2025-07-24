import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { aiService, type ChatMessage, type AIResponse } from '../../services/ai.service';
import './AIChatBox.css';

interface AIChatBoxProps {
  className?: string;
  compact?: boolean;
  onMessageSent?: (message: string) => void;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({ 
  className = '', 
  compact = false,
  onMessageSent 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 获取快速建议
  useEffect(() => {
    const loadQuickSuggestions = async () => {
      const suggestions = await aiService.getQuickSuggestions();
      setQuickSuggestions(suggestions);
    };
    loadQuickSuggestions();
  }, []);

  // 发送消息
  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim();
    if (!message || isLoading) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setSuggestions([]);

    // 调用回调
    onMessageSent?.(message);

    try {
      // 获取AI回复
      const response: AIResponse = await aiService.sendMessage(message, messages);
      
      // 添加AI回复
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 设置建议
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我现在遇到了一些问题。请稍后再试，或者尝试使用其他功能！',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 选择建议
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
    setSuggestions([]);
  };

  if (compact) {
    return (
      <div className={`ai-chatbox-compact ${className}`}>
        <div className="chatbox-container">
          {/* 标题栏 */}
          <div className="chatbox-header">
            <div className="bot-avatar">
              <Bot className="bot-icon-sm" />
            </div>
            <div className="header-text">
              <h3 className="chatbox-title">AI 旅行助手</h3>
              <p className="chatbox-subtitle">问我任何旅行问题！</p>
            </div>
            <Sparkles className="sparkles-icon" />
          </div>

          {/* 输入区域 */}
          <div className="input-section">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="比如：推荐一个周末旅行目的地..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Loader2 className="icon-loading" />
              ) : (
                <Send className="icon-send" />
              )}
            </button>
          </div>

          {/* 快速建议 */}
          {messages.length === 0 && quickSuggestions.length > 0 && (
            <div className="suggestions-section">
              <p className="suggestions-label">💡 试试这些问题：</p>
              <div className="suggestions-grid">
                {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 展开按钮 */}
          {messages.length > 0 && (
            <div className="expand-section">
              <button
                onClick={() => setIsExpanded(true)}
                className="expand-button"
              >
                <MessageCircle className="icon-message" />
                <span>查看完整对话</span>
                <Maximize2 className="icon-expand" />
              </button>
            </div>
          )}
        </div>

        {/* 展开的对话窗口 */}
        {isExpanded && (
          <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              {/* 头部 */}
              <div className="modal-header">
                <div className="modal-title-section">
                  <div className="modal-bot-avatar">
                    <Bot className="modal-bot-icon" />
                  </div>
                  <div>
                    <h3 className="modal-title">AI 旅行助手</h3>
                    <p className="modal-subtitle">智能旅行规划专家</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    onClick={clearChat}
                    className="modal-action-button"
                    title="清空对话"
                  >
                    <X className="modal-action-icon" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="modal-action-button"
                  >
                    <Minimize2 className="modal-action-icon" />
                  </button>
                </div>
              </div>

              {/* 消息区域 */}
              <div className="modal-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-avatar">
                        {message.sender === 'user' ? (
                          <User className="avatar-icon" />
                        ) : (
                          <Bot className="avatar-icon" />
                        )}
                      </div>
                      <div className="message-content">
                        <p className="message-text">{message.content}</p>
                        <div className="message-time">
                          {message.timestamp.toLocaleTimeString('zh-CN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message-wrapper ai-message">
                    <div className="message-bubble">
                      <div className="message-avatar">
                        <Bot className="avatar-icon" />
                      </div>
                      <div className="message-content">
                        <div className="loading-indicator">
                          <Loader2 className="loading-spinner" />
                          <span className="loading-text">正在思考...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* 建议区域 */}
              {suggestions.length > 0 && (
                <div className="modal-suggestions">
                  <div className="modal-suggestions-content">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="modal-suggestion-button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 输入区域 */}
              <div className="modal-input-section">
                <div className="modal-input-wrapper">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="继续对话..."
                    className="modal-input"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="modal-send-button"
                  >
                    {isLoading ? (
                      <Loader2 className="icon-loading" />
                    ) : (
                      <Send className="icon-send" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // 完整版UI（备用）
  return (
    <div className={`${className} bg-white rounded-2xl shadow-xl`}>
      {/* 完整版实现 */}
    </div>
  );
};

export default AIChatBox; 