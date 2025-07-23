import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Bell, Heart, MessageCircle, Bookmark, Share2, MapPin, MoreHorizontal, Play, Images } from 'lucide-react';
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
  Divider
} from '@mantine/core';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/ui/Logo';
import PostFilters from '../components/discover/PostFilters';
import CreatePostModal from '../components/discover/CreatePostModal';
import EmptyState from '../components/discover/EmptyState';
import LocationBasedContent from '../components/location/LocationBasedContent';
import { useAuth } from '../hooks/useAuth';

interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  location: string;
  tags: string[];
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

const Discover: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('推荐');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const filterTabs = ['推荐', '关注', '热门', '最新', '附近'];
  const topicTags = ['#美食', '#旅行', '#风景', '#摄影', '#城市', '#自然'];
  const { user } = useAuth();


  // Mock data for demonstration
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: '美丽的日落风景',
        content: '今天在海边看到了最美的日落，分享给大家！',
        images: ['https://picsum.photos/400/300?random=1'],
        location: '三亚海滩',
        tags: ['#风景', '#日落'],
        author: {
          id: 1,
          name: '旅行者小王',
          avatar: 'https://picsum.photos/40/40?random=1'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 128,
        comments: 23,
        bookmarks: 45,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: 2,
        title: '城市夜景探索',
        content: '夜晚的城市有着不同的魅力，霓虹灯下的街道充满了故事。',
        images: ['https://picsum.photos/400/500?random=2', 'https://picsum.photos/400/400?random=3'],
        location: '上海外滩',
        tags: ['#夜景', '#城市'],
        author: {
          id: 2,
          name: '摄影师李明',
          avatar: 'https://picsum.photos/40/40?random=2'
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 256,
        comments: 67,
        bookmarks: 89,
        isLiked: true,
        isBookmarked: false
      },
      {
        id: 3,
        title: '山间小径',
        content: '徒步在山间小径上，呼吸着新鲜的空气，感受大自然的美好。',
        images: ['https://picsum.photos/400/600?random=4'],
        location: '黄山',
        tags: ['#徒步', '#自然'],
        author: {
          id: 3,
          name: '户外达人张三',
          avatar: 'https://picsum.photos/40/40?random=3'
        },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 89,
        comments: 12,
        bookmarks: 34,
        isLiked: false,
        isBookmarked: true
      }
    ];
    
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

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

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked, bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1 }
        : post
    ));
  };

  const handleCreatePost = async (postData: any) => {
    try {
      // 这里应该调用API来创建帖子
      console.log('创建帖子:', postData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建新帖子对象
      const newPost = {
        id: Date.now(),
        title: postData.content.slice(0, 50) + (postData.content.length > 50 ? '...' : ''),
        content: postData.content,
        author: {
          id: 1,
          name: '当前用户',
          avatar: 'https://picsum.photos/40/40?random=user'
        },
        images: postData.files?.length > 0 ? [
          'https://picsum.photos/400/300?random=' + Date.now()
        ] : [],
        location: postData.location || '',
        tags: postData.tags || [],
        likes: 0,
        comments: 0,
        bookmarks: 0,
        createdAt: new Date(),
        isLiked: false,
        isBookmarked: false
      };
      
      // 将新帖子添加到列表顶部
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // 关闭模态框
      setShowCreateModal(false);
    } catch (error) {
      console.error('创建帖子失败:', error);
      throw error;
    }
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
            />

            {/* 右侧功能区 */}
            <Group gap="xs">
              <ThemeToggle />
              
              <Button
                onClick={() => setShowCreateModal(true)}
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
                src={user?.user_metadata?.avatar_url || 'https://picsum.photos/32/32?random=user'}
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
                    <Tabs.Tab key={tab} value={tab}>
                      {tab}
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
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Group>
            
            {/* 筛选按钮 */}
            <ActionIcon
              variant={showFilters ? 'filled' : 'subtle'}
              size="lg"
              radius="xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
            </ActionIcon>
          </Group>
        </Container>
      </Paper>

      {/* 主内容区 */}
      <Stack gap="lg">
        {/* 筛选面板 */}
        {showFilters && (
          <Paper p="md" radius="xl" shadow="sm" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <PostFilters />
          </Paper>
        )}

        {/* 附近内容 - 基于位置的推荐 */}
        {activeFilter === '附近' && (
          <LocationBasedContent 
            title="附近的精彩推荐"
            subtitle="发现您身边的美食、景点和活动"
            showFilters={true}
            defaultFilters={{ maxDistance: 25, minRating: 4.0 }}
          />
        )}

        {/* 瀑布流内容 */}
        {activeFilter === '附近' ? null : loading ? (
          <Grid>
            {[...Array(12)].map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card padding="lg" radius="xl" shadow="sm" style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
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
        ) : activeFilter === '附近' ? null : posts.length === 0 ? (
          <Center py="xl">
            <EmptyState 
              type="discover" 
              onAction={() => setShowCreateModal(true)}
            />
          </Center>
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
                      src={post.images[0]}
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
                    
                    {/* 视频标识 */}
                    {post.content.includes('视频') && (
                      <Center
                        pos="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                      >
                        <ActionIcon size="xl" radius="xl" variant="filled" color="dark">
                          <Play size={24} />
                        </ActionIcon>
                      </Center>
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
                        {post.tags.map((tag) => (
                          <Badge key={tag} size="xs" variant="light" radius="xl">
                            {tag}
                          </Badge>
                        ))}
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
                    
                    <Divider size="xs" />
                    
                    {/* 互动栏 */}
                    <Group justify="space-between">
                      <Group gap="lg">
                        <Group gap={4}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color={post.isLiked ? 'red' : 'gray'}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart size={14} fill={post.isLiked ? 'currentColor' : 'none'} />
                          </ActionIcon>
                          <Text size="xs">{formatNumber(post.likes)}</Text>
                        </Group>
                        
                        <Group gap={4}>
                          <ActionIcon variant="subtle" size="sm" color="gray">
                            <MessageCircle size={14} />
                          </ActionIcon>
                          <Text size="xs">{formatNumber(post.comments)}</Text>
                        </Group>
                        
                        <Group gap={4}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color={post.isBookmarked ? 'blue' : 'gray'}
                            onClick={() => handleBookmark(post.id)}
                          >
                            <Bookmark size={14} fill={post.isBookmarked ? 'currentColor' : 'none'} />
                          </ActionIcon>
                          <Text size="xs">{formatNumber(post.bookmarks)}</Text>
                        </Group>
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

      </Stack>
      
      {/* 创建帖子模态框 */}
      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </Container>
  );
};

export default Discover;