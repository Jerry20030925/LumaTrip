import React, { useState } from 'react';
import {
  Group,
  Avatar,
  Textarea,
  Button,
  ActionIcon,
  Menu,
  Stack,
  Text,
  Paper,
  Box,
  Tooltip,
} from '@mantine/core';
import {
  Send,
  Smile,
  AtSign,
  Hash,
  Image,
  MapPin,
  MessageCircle,
  Reply
} from 'lucide-react';
import { notifications } from '@mantine/notifications';

interface QuickReplyProps {
  postId?: string;
  parentCommentId?: string;
  placeholder?: string;
  userAvatar?: string;
  onSubmit?: (content: string, mentions?: string[], tags?: string[]) => Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
  maxLength?: number;
  variant?: 'comment' | 'reply' | 'message';
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  replyTo?: {
    username: string;
    content: string;
  };
}

const QuickReply: React.FC<QuickReplyProps> = ({
  postId: _postId,
  parentCommentId: _parentCommentId,
  placeholder = '写下你的想法...',
  userAvatar,
  onSubmit,
  onCancel,
  showCancel = false,
  maxLength = 500,
  variant = 'comment',
  size = 'md',
  autoFocus = false,
  replyTo
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      
      // Extract mentions and hashtags
      const mentionMatches = content.match(/@(\w+)/g) || [];
      const tagMatches = content.match(/#(\w+)/g) || [];
      
      const extractedMentions = mentionMatches.map(m => m.substring(1));
      const extractedTags = tagMatches.map(t => t.substring(1));
      
      if (onSubmit) {
        await onSubmit(content, extractedMentions, extractedTags);
      }
      
      setContent('');
      
      notifications.show({
        message: variant === 'reply' ? '回复成功！' : '评论成功！',
        color: 'green',
        icon: <MessageCircle size={16} />
      });
    } catch {
      notifications.show({
        message: '发送失败，请重试',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };



  const getPlaceholder = () => {
    if (replyTo) {
      return `回复 @${replyTo.username}...`;
    }
    return placeholder;
  };

  const remainingChars = maxLength - content.length;
  const isNearLimit = remainingChars <= 50;
  const isOverLimit = remainingChars < 0;

  return (
    <Paper
      p={size === 'sm' ? 'sm' : 'md'}
      radius="md"
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-gray-0)'
      }}
    >
      <Stack gap="sm">
        {/* Reply Context */}
        {replyTo && (
          <Box
            p="xs"
            style={{
              backgroundColor: 'var(--mantine-color-gray-1)',
              borderRadius: '8px',
              borderLeft: '3px solid var(--mantine-color-blue-6)'
            }}
          >
            <Group gap="xs">
              <Reply size={12} />
              <Text size="xs" c="dimmed">
                回复 @{replyTo.username}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" lineClamp={2}>
              {replyTo.content}
            </Text>
          </Box>
        )}

        {/* Main Input */}
        <Group gap="sm" align="flex-start">
          <Avatar
            src={userAvatar}
            size={size === 'sm' ? 'sm' : 'md'}
            radius="xl"
            style={{ flexShrink: 0 }}
          />
          
          <Stack gap="sm" style={{ flex: 1 }}>
            <Textarea
              placeholder={getPlaceholder()}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autosize
              minRows={size === 'sm' ? 2 : 3}
              maxRows={8}
              autoFocus={autoFocus}
              style={{
                backgroundColor: 'white'
              }}
              error={isOverLimit ? `超出字数限制 ${Math.abs(remainingChars)} 字` : undefined}
            />
            
            {/* Toolbar */}
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Menu>
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm">
                      <Smile size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Group gap="xs" p="xs">
                      {['😊', '😂', '❤️', '👍', '👎', '😍', '😢', '😮', '😡'].map(emoji => (
                        <ActionIcon
                          key={emoji}
                          variant="subtle"
                          size="sm"
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </ActionIcon>
                      ))}
                    </Group>
                  </Menu.Dropdown>
                </Menu>
                
                <Tooltip label="提及用户">
                  <ActionIcon variant="subtle" size="sm">
                    <AtSign size={14} />
                  </ActionIcon>
                </Tooltip>
                
                <Tooltip label="添加标签">
                  <ActionIcon variant="subtle" size="sm">
                    <Hash size={14} />
                  </ActionIcon>
                </Tooltip>
                
                <Tooltip label="添加图片">
                  <ActionIcon variant="subtle" size="sm">
                    <Image size={14} />
                  </ActionIcon>
                </Tooltip>
                
                <Tooltip label="添加位置">
                  <ActionIcon variant="subtle" size="sm">
                    <MapPin size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              
              <Group gap="xs" align="center">
                {/* Character Count */}
                <Text
                  size="xs"
                  c={isNearLimit ? (isOverLimit ? 'red' : 'orange') : 'dimmed'}
                >
                  {remainingChars}
                </Text>
                
                {/* Cancel Button */}
                {showCancel && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={onCancel}
                  >
                    取消
                  </Button>
                )}
                
                {/* Submit Button */}
                <Button
                  leftSection={<Send size={14} />}
                  size="xs"
                  onClick={handleSubmit}
                  disabled={!content.trim() || isOverLimit}
                  loading={loading}
                >
                  {variant === 'reply' ? '回复' : variant === 'message' ? '发送' : '评论'}
                </Button>
              </Group>
            </Group>
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
};

export default QuickReply;