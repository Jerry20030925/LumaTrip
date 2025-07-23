import React, { useState } from 'react';
import {
  Group,
  ActionIcon,
  Text,
  Menu,
  Modal,
  Textarea,
  Button,
  Stack,
  Tooltip,
  Divider
} from '@mantine/core';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Send,
  Flag,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

interface InteractionBarProps {
  postId: string;
  authorId: string;
  initialLikes: number;
  initialComments: number;
  initialBookmarks: number;
  initialViews?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  showComments?: boolean;
  onLike?: (postId: string, liked: boolean) => void;
  onComment?: (postId: string, comment: string) => void;
  onBookmark?: (postId: string, bookmarked: boolean) => void;
  onShare?: (postId: string, method: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
}

const InteractionBar: React.FC<InteractionBarProps> = ({
  postId,
  authorId: _authorId,
  initialLikes,
  initialComments,
  initialBookmarks,
  initialViews,
  isLiked = false,
  isBookmarked = false,
  showComments = true,
  onLike,
  onComment,
  onBookmark,
  onShare,
  size = 'md',
  variant = 'default'
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [views] = useState(initialViews || 0);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [commentModalOpened, { open: openCommentModal, close: closeCommentModal }] = useDisclosure(false);
  const [shareModalOpened, { open: openShareModal, close: closeShareModal }] = useDisclosure(false);

  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      setLikes(prev => newLiked ? prev + 1 : prev - 1);
      
      if (onLike) {
        await onLike(postId, newLiked);
      }

      if (newLiked) {
        notifications.show({
          message: '点赞成功！',
          color: 'red',
          icon: <Heart size={16} />
        });
      }
    } catch {
      // Revert on error
      setLiked(!liked);
      setLikes(prev => liked ? prev + 1 : prev - 1);
      notifications.show({
        message: '操作失败，请重试',
        color: 'red'
      });
    }
  };

  const handleBookmark = async () => {
    try {
      const newBookmarked = !bookmarked;
      setBookmarked(newBookmarked);
      setBookmarks(prev => newBookmarked ? prev + 1 : prev - 1);
      
      if (onBookmark) {
        await onBookmark(postId, newBookmarked);
      }

      notifications.show({
        message: newBookmarked ? '已收藏' : '已取消收藏',
        color: newBookmarked ? 'blue' : 'gray',
        icon: <Bookmark size={16} />
      });
    } catch {
      // Revert on error
      setBookmarked(!bookmarked);
      setBookmarks(prev => bookmarked ? prev + 1 : prev - 1);
      notifications.show({
        message: '操作失败，请重试',
        color: 'red'
      });
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setLoading(true);
      
      if (onComment) {
        await onComment(postId, commentText);
      }
      
      setComments(prev => prev + 1);
      setCommentText('');
      closeCommentModal();
      
      notifications.show({
        message: '评论发表成功！',
        color: 'green',
        icon: <MessageCircle size={16} />
      });
    } catch {
      notifications.show({
        message: '评论发表失败，请重试',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (method: string) => {
    try {
      const url = `${window.location.origin}/app/discover/post/${postId}`;
      
      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(url);
          notifications.show({
            message: '链接已复制到剪贴板',
            color: 'green',
            icon: <Copy size={16} />
          });
          break;
        case 'external':
          window.open(url, '_blank');
          break;
        default:
          break;
      }
      
      if (onShare) {
        await onShare(postId, method);
      }
      
      closeShareModal();
    } catch {
      notifications.show({
        message: '分享失败，请重试',
        color: 'red'
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 20;
      default: return 16;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'xs';
      case 'lg': return 'md';
      default: return 'sm';
    }
  };

  if (variant === 'minimal') {
    return (
      <Group gap="lg">
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            color={liked ? 'red' : 'gray'}
            size={size}
            onClick={handleLike}
          >
            <Heart size={getIconSize()} fill={liked ? 'currentColor' : 'none'} />
          </ActionIcon>
          <Text size={getTextSize()} c={liked ? 'red' : 'dimmed'}>
            {formatNumber(likes)}
          </Text>
        </Group>
        
        {showComments && (
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={size}
              onClick={openCommentModal}
            >
              <MessageCircle size={getIconSize()} />
            </ActionIcon>
            <Text size={getTextSize()} c="dimmed">
              {formatNumber(comments)}
            </Text>
          </Group>
        )}
        
        <ActionIcon
          variant="subtle"
          color={bookmarked ? 'blue' : 'gray'}
          size={size}
          onClick={handleBookmark}
        >
          <Bookmark size={getIconSize()} fill={bookmarked ? 'currentColor' : 'none'} />
        </ActionIcon>
        
        <ActionIcon
          variant="subtle"
          color="gray"
          size={size}
          onClick={openShareModal}
        >
          <Share2 size={getIconSize()} />
        </ActionIcon>
      </Group>
    );
  }

  return (
    <>
      <Group justify="space-between" align="center">
        <Group gap="xl">
          <Tooltip label={liked ? '取消点赞' : '点赞'}>
            <Group gap={6} style={{ cursor: 'pointer' }} onClick={handleLike}>
              <ActionIcon
                variant="subtle"
                color={liked ? 'red' : 'gray'}
                size={size}
              >
                <Heart size={getIconSize()} fill={liked ? 'currentColor' : 'none'} />
              </ActionIcon>
              <Text size={getTextSize()} c={liked ? 'red' : 'dimmed'} fw={liked ? 600 : 400}>
                {formatNumber(likes)}
              </Text>
            </Group>
          </Tooltip>
          
          {showComments && (
            <Tooltip label="评论">
              <Group gap={6} style={{ cursor: 'pointer' }} onClick={openCommentModal}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={size}
                >
                  <MessageCircle size={getIconSize()} />
                </ActionIcon>
                <Text size={getTextSize()} c="dimmed">
                  {formatNumber(comments)}
                </Text>
              </Group>
            </Tooltip>
          )}
          
          <Tooltip label={bookmarked ? '取消收藏' : '收藏'}>
            <Group gap={6} style={{ cursor: 'pointer' }} onClick={handleBookmark}>
              <ActionIcon
                variant="subtle"
                color={bookmarked ? 'blue' : 'gray'}
                size={size}
              >
                <Bookmark size={getIconSize()} fill={bookmarked ? 'currentColor' : 'none'} />
              </ActionIcon>
              <Text size={getTextSize()} c={bookmarked ? 'blue' : 'dimmed'}>
                {formatNumber(bookmarks)}
              </Text>
            </Group>
          </Tooltip>
          
          {variant === 'detailed' && views > 0 && (
            <Tooltip label="浏览量">
              <Group gap={6}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={size}
                >
                  <Eye size={getIconSize()} />
                </ActionIcon>
                <Text size={getTextSize()} c="dimmed">
                  {formatNumber(views)}
                </Text>
              </Group>
            </Tooltip>
          )}
        </Group>
        
        <Group gap="xs">
          <Tooltip label="分享">
            <ActionIcon
              variant="subtle"
              color="gray"
              size={size}
              onClick={openShareModal}
            >
              <Share2 size={getIconSize()} />
            </ActionIcon>
          </Tooltip>
          
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size={size}>
                <Flag size={getIconSize()} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Flag size={14} />} color="red">
                举报内容
              </Menu.Item>
              <Menu.Item leftSection={<Copy size={14} />} onClick={() => handleShare('copy')}>
                复制链接
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Comment Modal */}
      <Modal
        opened={commentModalOpened}
        onClose={closeCommentModal}
        title="发表评论"
        size="md"
        centered
      >
        <Stack gap="md">
          <Textarea
            placeholder="写下你的评论..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            minRows={3}
            maxRows={6}
            autosize
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeCommentModal}>
              取消
            </Button>
            <Button
              leftSection={<Send size={16} />}
              onClick={handleComment}
              disabled={!commentText.trim()}
              loading={loading}
            >
              发表评论
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Share Modal */}
      <Modal
        opened={shareModalOpened}
        onClose={closeShareModal}
        title="分享帖子"
        size="sm"
        centered
      >
        <Stack gap="md">
          <Button
            leftSection={<Copy size={16} />}
            variant="light"
            fullWidth
            onClick={() => handleShare('copy')}
          >
            复制链接
          </Button>
          <Button
            leftSection={<ExternalLink size={16} />}
            variant="light"
            fullWidth
            onClick={() => handleShare('external')}
          >
            在新窗口中打开
          </Button>
          <Divider />
          <Text size="sm" c="dimmed" ta="center">
            更多分享选项即将推出
          </Text>
        </Stack>
      </Modal>
    </>
  );
};

export default InteractionBar;