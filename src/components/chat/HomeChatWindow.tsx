import React, { useEffect, useRef } from 'react';
import { Stack, Text, Paper, ScrollArea, Group, Loader } from '@mantine/core';
import './Chat.css';

interface ChatMessage {
  text: string;
  sender: string;
  timestamp: Date;
}

interface HomeChatWindowProps {
  messages: ChatMessage[];
  isAiTyping: boolean;
}

const HomeChatWindow: React.FC<HomeChatWindowProps> = ({ messages, isAiTyping }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动到底部
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  return (
    <ScrollArea 
      h={350} 
      ref={scrollAreaRef}
      style={{ padding: '12px' }}
    >
      <Stack gap="sm">
        {messages.map((message, index) => {
          const isUser = message.sender === 'You';
          return (
            <Paper
              key={index}
              p="sm"
              radius="lg"
              style={{
                backgroundColor: isUser 
                  ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' 
                  : 'rgba(248, 249, 250, 0.8)',
                color: isUser ? 'white' : '#333',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: isUser 
                  ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' 
                  : 'rgba(248, 249, 250, 0.8)',
                border: isUser ? 'none' : '1px solid #e9ecef'
              }}
            >
              <Text size="xs" c={isUser ? 'rgba(255,255,255,0.8)' : 'dimmed'} mb={4}>
                {message.sender}
              </Text>
              <Text size="sm" style={{ lineHeight: 1.4 }}>
                {message.text}
              </Text>
            </Paper>
          );
        })}
        
        {isAiTyping && (
          <Paper
            p="sm"
            radius="lg"
            style={{
              backgroundColor: 'rgba(248, 249, 250, 0.8)',
              color: '#333',
              alignSelf: 'flex-start',
              maxWidth: '80%',
              border: '1px solid #e9ecef'
            }}
          >
            <Group gap="xs">
              <Loader size="xs" />
              <Text size="sm" c="dimmed">
                Luma 正在输入...
              </Text>
            </Group>
          </Paper>
        )}
      </Stack>
    </ScrollArea>
  );
};

export default HomeChatWindow;