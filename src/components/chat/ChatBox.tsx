import { useState } from 'react';
import { TextInput, Button, Box, Paper, Text } from '@mantine/core';
import { getChatCompletion } from '../../services/chat.service';

const ChatBox = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    const aiResponse = await getChatCompletion(input);
    if (aiResponse) {
      setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    }
  };

  return (
    <Paper shadow="xs" p="md" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
      <Box style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, index) => (
          <Text
            key={index}
            style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}
          >
            {msg.text}
          </Text>
        ))}
      </Box>
      <Box style={{ display: 'flex' }}>
        <TextInput
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder="Ask me anything..."
          style={{ flex: 1, marginRight: '1rem' }}
          onKeyPress={(event) => event.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;