import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Bell, Heart, MessageCircle, Bookmark, Share2, MapPin, MoreHorizontal, Images, X } from 'lucide-react';
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
  Skeleton,
  Center,
  Tabs,
  Menu,
  Indicator,
  Image,
  Divider,
  Modal,
  Textarea
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/ui/Logo';
import { useAuth } from '../hooks/useAuth';
import { postsService, type Post, type Comment, type CreatePostData } from '../services/posts.service';

const Discover: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('推荐');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 创建帖子相关状态
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [createPostData, setCreatePostData] = useState<CreatePostData>({
    title: '',
    content: '',
    images: [],
    location: '',
    tags: []
  });
  const [createLoading, setCreateLoading] = useState(false);

  // 评论相关状态
  const [commentsModalOpened, { open: openCommentsModal, close: closeCommentsModal }] = useDisclosure(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const { user } = useAuth();
  const userId = user?.id || 'current-user';

  const filterTabs = [
    { key: '推荐', value: 'recommended' },
    { key: '关注', value: 'following' },
    { key: '热门', value: 'trending' },
    { key: '最新', value: 'all' },
    { key: '附近', value: 'nearby' }
  ];
  
  const topicTags = ['#美食', '#旅行', '#风景', '#摄影', '#城市', '#自然'];

  // 加载帖子
  const loadPosts = async (pageNum = 1, filterType = 'recommended', isRefresh = false) => {
    try {
      if (pageNum === 1 || isRefresh) {
        setLoading(true);
      }

      const filterMap: { [key: string]: 'all' | 'following' | 'recommended' | 'trending' | 'nearby' } = {
        '推荐': 'recommended',
        '关注': 'following',
        '热门': 'trending',
        '最新': 'all',
        '附近': 'nearby'
      };

      const response = await postsService.getPosts(
        pageNum,
        20,
        filterMap[filterType] || 'recommended',
        userId
      );

      if (pageNum === 1 || isRefresh) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }

      setHasMore(response.posts.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadPosts(1, activeFilter, true);
  }, [activeFilter, userId]);

  // 搜索帖子
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadPosts(1, activeFilter, true);
      return;
    }

    try {
      setLoading(true);
      const results = await postsService.searchPosts(query, userId);
      setPosts(results);
      setHasMore(false);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async (postId: string) => {
    try {
      const isLiked = await postsService.toggleLike(postId, userId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked,
              likes: isLiked ? post.likes + 1 : post.likes - 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // 处理收藏
  const handleBookmark = async (postId: string) => {
    try {
      const isBookmarked = await postsService.toggleBookmark(postId, userId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isBookmarked,
              bookmarks: isBookmarked ? post.bookmarks + 1 : post.bookmarks - 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // 打开评论模态框
  const handleOpenComments = async (post: Post) => {
    setSelectedPost(post);
    try {
      const postComments = await postsService.getComments(post.id, userId);
      setComments(postComments);
      openCommentsModal();
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // 添加评论
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const comment = await postsService.addComment(selectedPost.id, newComment, userId);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // 更新帖子的评论数
      setPosts(prev => prev.map(post => 
        post.id === selectedPost.id 
          ? { ...post, comments: post.comments + 1, isCommented: true }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // 创建帖子
  const handleCreatePost = async () => {
    if (!createPostData.content.trim()) return;

    try {
      setCreateLoading(true);
      const newPost = await postsService.createPost(createPostData, userId);
      setPosts(prev => [newPost, ...prev]);
      setCreatePostData({ title: '', content: '', images: [], location: '', tags: [] });
      closeCreateModal();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreateLoading(false);
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
    <Container size="xl" px="md" style={{ minHeight: '100vh' }}>
      {/* 固定顶部导航栏 */}
      <Paper shadow="sm" radius={0} pos="sticky" top={0} style={{ 
        zIndex: 50, 
        marginBottom: '1rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Container size="xl" px="md">
          <Group justify="space-between" py="md">
            {/* 左侧 Logo */}
            <Logo 
              size="lg" 
              variant="full" 
              clickable={true} 
              onClick={() => window.location.href = '/'}
            />

            {/* 中间搜索栏 */}
            <TextInput
              placeholder="搜索精彩内容..."
              leftSection={<Search size={16} />}
              radius="xl"
              size="sm"
              style={{ flex: 1, maxWidth: '500px' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === '') {
                  loadPosts(1, activeFilter, true);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
            />

            {/* 右侧功能区 */}
            <Group gap="xs">
              <ThemeToggle />
              
              <Button
                onClick={openCreateModal}
                size="sm"
                radius="xl"
                leftSection={<Plus size={16} />}
              >
                创建
              </Button>

              <Indicator inline size={10} offset={7} position="top-end" color="red">
                <ActionIcon variant="subtle" size="lg" radius="xl">
                  <Bell size={18} />
                </ActionIcon>
              </Indicator>

              <Avatar
                src={user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                size="sm"
                radius="xl"
                style={{ cursor: 'pointer' }}
              />
            </Group>
          </Group>
        </Container>

        {/* 次级导航/筛选栏 */}
        <Container size="xl" px="md">
          <Group justify="space-between" py="sm">
            <Group gap="sm">
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
              
              {/* 话题标签 */}
              <Group gap="xs">
                {topicTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="light"
                    radius="xl"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSearch(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Group>
            
            {/* 筛选按钮 */}
            <ActionIcon variant="subtle" size="lg" radius="xl">
              <Filter size={18} />
            </ActionIcon>
          </Group>
        </Container>
      </Paper>

      {/* 主内容区 */}
      <Stack gap="lg">
        {/* 瀑布流内容 */}
        {loading && posts.length === 0 ? (
          <Grid>
            {[...Array(12)].map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card padding="lg" radius="xl" shadow="sm">
                  <Skeleton height={200} mb="md" />
                  <Skeleton height={12} mb="xs" />
                  <Skeleton height={12} width="75%" mb="md" />
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Skeleton height={24} circle />
                      <Skeleton height={12} width={80} />
                    </Group>
                    <Skeleton height={12} width={50} />
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Grid>
            {posts.map((post) => (
              <Grid.Col key={post.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card padding="lg" radius="xl" shadow="sm" style={{ 
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  {/* 图片区域 */}
                  <Card.Section pos="relative">
                    <Image
                      src={post.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'}
                      alt={post.title}
                      height={200}
                      fit="cover"
                    />
                    
                    {/* 多图标识 */}
                    {post.images.length > 1 && (
                      <Badge
                        pos="absolute"
                        top={8}
                        right={8}
                        variant="filled"
                        color="dark"
                        leftSection={<Images size={12} />}
                        size="sm"
                        radius="xl"
                      >
                        {post.images.length}
                      </Badge>
                    )}
                  </Card.Section>

                  <Stack gap="xs">
                    {/* 标题/描述 */}
                    <Title order={4} size="sm" lineClamp={2}>{post.title}</Title>
                    <Text size="xs" c="dimmed" lineClamp={2}>{post.content}</Text>
                    
                    {/* 位置标签 */}
                    {post.location && (
                      <Group gap={4}>
                        <MapPin size={12} />
                        <Text size="xs" c="dimmed">{post.location}</Text>
                      </Group>
                    )}
                    
                    {/* 话题标签 */}
                    {post.tags.length > 0 && (
                      <Group gap={4}>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} size="xs" variant="light" radius="xl">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Text size="xs" c="dimmed">+{post.tags.length - 2}</Text>
                        )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                        >
                          <Heart size={14} fill={post.isLiked ? "currentColor" : "none"} />
                        </ActionIcon>
                        <Text size="xs" c="dimmed">{formatNumber(post.likes)}</Text>
                        
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenComments(post);
                          }}
                        >
                          <MessageCircle size={14} />
                        </ActionIcon>
                        <Text size="xs" c="dimmed">{formatNumber(post.comments)}</Text>
                        
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          color={post.isBookmarked ? "blue" : "gray"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(post.id);
                          }}
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
            ))}
          </Grid>
        )}

        {/* 加载更多 */}
        {hasMore && !loading && posts.length > 0 && (
          <Center py="xl">
            <Button 
              variant="outline" 
              onClick={() => loadPosts(page + 1, activeFilter)}
              loading={loading}
            >
              加载更多
            </Button>
          </Center>
        )}
      </Stack>
      
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
          
          <div>
            <Text size="sm" fw={500} mb="xs">标签</Text>
            <Group gap="xs" mb="xs">
              {topicTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={createPostData.tags?.includes(tag) ? "filled" : "light"}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const newTags = createPostData.tags?.includes(tag)
                      ? createPostData.tags.filter(t => t !== tag)
                      : [...(createPostData.tags || []), tag];
                    setCreatePostData(prev => ({ ...prev, tags: newTags }));
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </Group>
            <TextInput
              placeholder="添加自定义标签（用空格分隔）"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  const newTags = input.value.split(' ').filter(t => t.trim()).map(t => t.startsWith('#') ? t : `#${t}`);
                  if (newTags.length > 0) {
                    setCreatePostData(prev => ({ 
                      ...prev, 
                      tags: [...(prev.tags || []), ...newTags.filter(t => !prev.tags?.includes(t))]
                    }));
                    input.value = '';
                  }
                }
              }}
            />
            {createPostData.tags && createPostData.tags.length > 0 && (
              <Group gap="xs" mt="xs">
                {createPostData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="filled"
                    rightSection={
                      <X 
                        size={12} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setCreatePostData(prev => ({
                            ...prev,
                            tags: prev.tags?.filter((_, i) => i !== index)
                          }));
                        }}
                      />
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
            )}
          </div>
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeCreateModal}>
              取消
            </Button>
            <Button 
              onClick={handleCreatePost}
              loading={createLoading}
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
              <Group key={comment.id} align="flex-start" gap="sm">
                <Avatar src={comment.author.avatar} size="sm" radius="xl" />
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="sm">
                    <Text size="sm" fw={500}>{comment.author.name}</Text>
                    <Text size="xs" c="dimmed">{formatTimeAgo(comment.createdAt)}</Text>
                  </Group>
                  <Text size="sm">{comment.content}</Text>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" size="xs" color={comment.isLiked ? "red" : "gray"}>
                      <Heart size={12} fill={comment.isLiked ? "currentColor" : "none"} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">{comment.likes}</Text>
                  </Group>
                </Stack>
              </Group>
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