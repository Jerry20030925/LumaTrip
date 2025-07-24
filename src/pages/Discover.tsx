import React, { useState, useEffect } from 'react';
import { Search, Plus, Heart, MessageCircle, Bookmark, Share2, MapPin, MoreHorizontal } from 'lucide-react';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Group,
  Badge,
  Card,
  Text,
  Avatar,
  ActionIcon,
  Grid,
  Stack,
  Title,
  Tabs,
  Menu,
  Image,
  Divider,
  Modal,
  Textarea
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { postsService, type Post, type Comment } from '../services/posts.service';
import { useAuth } from '../hooks/useAuth';

const Discover: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('推荐');
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 创建帖子相关状态
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [createPostData, setCreatePostData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    location: '',
    tags: [] as string[]
  });

  // 评论相关状态
  const [commentsModalOpened, { open: openCommentsModal, close: closeCommentsModal }] = useDisclosure(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const filterTabs = [
    { key: '推荐', value: 'recommended' },
    { key: '关注', value: 'following' },
    { key: '热门', value: 'trending' },
    { key: '最新', value: 'all' },
    { key: '附近', value: 'nearby' }
  ];
  
  const topicTags = ['#美食', '#旅行', '#风景', '#摄影', '#城市', '#自然'];

  // 加载帖子
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await postsService.getPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  // 处理收藏
  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isBookmarked: !post.isBookmarked,
            bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1
          }
        : post
    ));
  };

  // 打开评论模态框
  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    // 模拟评论数据
    const mockComments = [
      {
        id: '1',
        content: '太美了！',
        author: {
          id: '1',
          name: '用户A',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 5,
        isLiked: false
      }
    ];
    setComments(mockComments);
    openCommentsModal();
  };

  // 添加评论
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const newCommentObj = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: user?.id || 'mock-user', // Use user.id if available, otherwise mock
        name: user?.user_metadata?.full_name || '用户',
        avatar: user?.user_metadata?.avatar_url || ''
      },
      createdAt: new Date(),
      likes: 0,
      isLiked: false
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
    
    // 更新帖子的评论数
    setPosts(prev => prev.map(post => 
      post.id === selectedPost.id 
        ? { ...post, comments: post.comments + 1, isCommented: true }
        : post
    ));
  };

  // 创建帖子
  const handleCreatePost = async () => {
    if (!createPostData.content.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      title: createPostData.title || '新帖子',
      content: createPostData.content,
      images: createPostData.images,
      location: createPostData.location,
      tags: createPostData.tags,
      author: {
        id: user?.id || 'mock-user', // Use user.id if available, otherwise mock
        name: user?.user_metadata?.full_name || '用户',
        avatar: user?.user_metadata?.avatar_url || ''
      },
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      bookmarks: 0,
      isLiked: false,
      isBookmarked: false,
      isCommented: false
    };

    try {
      await postsService.createPost(newPost);
      setPosts(prev => [newPost, ...prev]);
      setCreatePostData({ title: '', content: '', images: [], location: '', tags: [] });
      closeCreateModal();
    } catch (error) {
      console.error('创建帖子失败:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    return `${Math.floor(diffInHours / 24)}天前`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <Container size="xl" px="md" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
      {/* 头部搜索和操作栏 */}
      <Paper p="md" radius="xl" shadow="sm" mb="xl" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Group justify="space-between">
          <Title order={1} size="xl">发现</Title>
          
          <Group gap="md">
            <TextInput
              placeholder="搜索精彩内容..."
              leftSection={<Search size={16} />}
              radius="xl"
              style={{ width: '300px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Button
              onClick={openCreateModal}
              leftSection={<Plus size={16} />}
              radius="xl"
            >
              创建
            </Button>
          </Group>
        </Group>

        {/* 筛选标签 */}
        <Group gap="sm" mt="md">
          <Tabs value={activeFilter} onChange={(value) => setActiveFilter(value || '推荐')}>
            <Tabs.List>
              {filterTabs.map((tab) => (
                <Tabs.Tab key={tab.key} value={tab.key}>
                  {tab.key}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          
          <Divider orientation="vertical" />
          
          <Group gap="xs">
            {topicTags.map((tag) => (
              <Badge
                key={tag}
                variant="light"
                radius="xl"
                style={{ cursor: 'pointer' }}
              >
                {tag}
              </Badge>
            ))}
          </Group>
        </Group>
      </Paper>

      {/* 主内容区 */}
      <Grid>
        {loading ? (
          <Grid.Col span={12}>
            <Stack align="center" justify="center" py="xl">
              <Text size="lg" c="dimmed">加载中...</Text>
            </Stack>
          </Grid.Col>
        ) : posts.length === 0 ? (
          <Grid.Col span={12}>
            <Stack align="center" justify="center" py="xl">
              <Text size="lg" c="dimmed">暂无帖子</Text>
            </Stack>
          </Grid.Col>
        ) : (
          posts.map((post) => (
            <Grid.Col key={post.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card padding="lg" radius="xl" shadow="sm" style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                {/* 图片展示 */}
                {post.images && post.images.length > 0 && (
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      radius="md"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    {post.images.length > 1 && (
                      <Badge
                        size="sm"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white'
                        }}
                      >
                        +{post.images.length - 1}
                      </Badge>
                    )}
                  </div>
                )}

                {/* 内容 */}
                <Stack gap="xs">
                  <Text fw={500} size="sm" lineClamp={2}>
                    {post.title}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={3}>
                    {post.content}
                  </Text>
                  
                  {/* 标签 */}
                  {post.tags && post.tags.length > 0 && (
                    <Group gap="xs" wrap="wrap">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} size="xs" variant="light">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge size="xs" variant="light">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </Group>
                  )}
                  
                  {/* 位置 */}
                  {post.location && (
                    <Group gap={4}>
                      <MapPin size={12} />
                      <Text size="xs" c="dimmed">{post.location}</Text>
                    </Group>
                  )}
                  
                  {/* 用户信息栏 */}
                  <Group justify="space-between" align="center">
                    <Group gap={8}>
                      <Avatar src={post.author.avatar} size={20} radius="xl" />
                      <Text size="xs" fw={500}>{post.author.name}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">{formatTimeAgo(post.createdAt)}</Text>
                  </Group>
                  
                  {/* 互动按钮 */}
                  <Group justify="space-between" align="center" pt="xs">
                    <Group gap="sm">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color={post.isLiked ? "red" : "gray"}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart size={14} fill={post.isLiked ? "currentColor" : "none"} />
                      </ActionIcon>
                      <Text size="xs" c="dimmed">{formatNumber(post.likes)}</Text>
                      
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="gray"
                        onClick={() => handleOpenComments(post)}
                      >
                        <MessageCircle size={14} />
                      </ActionIcon>
                      <Text size="xs" c="dimmed">{formatNumber(post.comments)}</Text>
                      
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color={post.isBookmarked ? "blue" : "gray"}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark size={14} fill={post.isBookmarked ? "currentColor" : "none"} />
                      </ActionIcon>
                      <Text size="xs" c="dimmed">{formatNumber(post.bookmarks)}</Text>
                    </Group>
                    
                    <Menu>
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" color="gray">
                          <MoreHorizontal size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Share2 size={14} />}>分享</Menu.Item>
                        <Menu.Item leftSection={<Heart size={14} />}>举报</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))
        )}
      </Grid>
      
      {/* 创建帖子模态框 */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="创建帖子"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="标题"
            placeholder="给你的帖子起个标题..."
            value={createPostData.title}
            onChange={(e) => setCreatePostData(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <Textarea
            label="内容"
            placeholder="分享你的精彩瞬间..."
            rows={4}
            value={createPostData.content}
            onChange={(e) => setCreatePostData(prev => ({ ...prev, content: e.target.value }))}
          />
          
          <TextInput
            label="位置"
            placeholder="你在哪里？"
            value={createPostData.location}
            onChange={(e) => setCreatePostData(prev => ({ ...prev, location: e.target.value }))}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeCreateModal}>
              取消
            </Button>
            <Button 
              onClick={handleCreatePost}
              disabled={!createPostData.content.trim()}
            >
              发布
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 评论模态框 */}
      <Modal
        opened={commentsModalOpened}
        onClose={closeCommentsModal}
        title={selectedPost?.title || '评论'}
        size="md"
      >
        <Stack gap="md">
          {/* 评论列表 */}
          <Stack gap="sm" mah={400} style={{ overflowY: 'auto' }}>
            {comments.map((comment) => (
              <Paper key={comment.id} p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Avatar size="sm" src={comment.author.avatar} />
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{comment.author.name}</Text>
                        <Text size="xs" c="dimmed">{formatTimeAgo(comment.createdAt)}</Text>
                      </Stack>
                    </Group>
                  </Group>
                  <Text size="sm">{comment.content}</Text>
                </Stack>
              </Paper>
            ))}
          </Stack>
          
          {/* 评论输入 */}
          <Group align="flex-end">
            <Textarea
              placeholder="写评论..."
              style={{ flex: 1 }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              发送
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default Discover;