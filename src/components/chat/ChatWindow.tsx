import { useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { getChatCompletion } from '../../services/chat.service';
import './Chat.css';

interface Message {
  text: string;
  sender: string;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello!', sender: 'Luma' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = { text, sender: 'You' };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setIsLoading(true);

    const aiResponseText = await getChatCompletion(text);
    const aiResponse: Message = {
      text: aiResponseText || 'Sorry, something went wrong.',
      sender: 'Luma',
    };
    setMessages(prevMessages => [...prevMessages, aiResponse]);
    setIsLoading(false);
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <ChatMessage key={index} text={msg.text} sender={msg.sender} />
        ))}
        {isLoading && <ChatMessage text="Luma is thinking..." sender="Luma" />}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;