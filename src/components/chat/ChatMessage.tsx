import React from 'react';

interface ChatMessageProps {
  text: string;
  sender: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, sender }) => {
  const isUser = sender === 'You';
  const messageClass = `chat-message ${isUser ? 'user' : 'ai'}`;
  
  return (
    <div className={messageClass}>
      <div className="sender">{sender}</div>
      <p>{text}</p>
    </div>
  );
};

export default ChatMessage;