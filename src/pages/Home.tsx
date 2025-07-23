import { useState, useEffect } from 'react';
import { Search, Plus, Heart, MessageCircle, Star, Globe, Image, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Badge, 
  Avatar, 
  Grid, 
  Paper,
  Stack,
  ActionIcon,
  TextInput,
  Box
} from '@mantine/core';
import CreatePostModal from '../components/discover/CreatePostModal';
import LocationBasedContent from '../components/location/LocationBasedContent';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  posts: number;
  tags: string[];
}

interface FeaturedContent {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  image: string;
  likes: number;
  comments: number;
  location: string;
}

const Home = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('推荐');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Mock destinations data
    const mockDestinations: Destination[] = [
      {
        id: '1',
        name: '巴厘岛',
        country: '印度尼西亚',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        rating: 4.8,
        posts: 1234,
        tags: ['海滩', '文化', '度假']
      },
      {
        id: '2',
        name: '京都',
        country: '日本',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        rating: 4.9,
        posts: 892,
        tags: ['文化', '历史', '樱花']
      },
      {
        id: '3',
        name: '圣托里尼',
        country: '希腊',
        image: 'https://images.unsplash.com/photo-1570077188648-56e4b16f9d72?w=400&h=300&fit=crop',
        rating: 4.7,
        posts: 756,
        tags: ['岛屿', '浪漫', '日落']
      },
      {
        id: '4',
        name: '马尔代夫',
        country: '马尔代夫',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        rating: 4.9,
        posts: 645,
        tags: ['海滩', '蜜月', '潜水']
      }
    ];
    setDestinations(mockDestinations);

    // Mock featured content
    const mockContent: FeaturedContent[] = [
      {
        id: '1',
        title: '发现巴厘岛的隐藏海滩',
        author: {
          name: '旅行探索者Alex',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        likes: 1234,
        comments: 89,
        location: '巴厘岛，印度尼西亚'
      },
      {
        id: '2',
        title: '京都樱花季完美指南',
        author: {
          name: '摄影师Sam',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        likes: 856,
        comments: 45,
        location: '京都，日本'
      },
      {
        id: '3',
        title: '瑞士阿尔卑斯山徒步体验',
        author: {
          name: '冒险者Mike',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        likes: 2156,
        comments: 156,
        location: '瑞士阿尔卑斯山'
      }
    ];
    setFeaturedContent(mockContent);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Container size="xl" px="md" style={{ paddingTop: '2rem' }}>
        {/* Welcome Header */}
        <Paper p="xl" mb="xl" radius="xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Group gap="sm" align="center">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Globe size={20} style={{ color: 'white' }} />
              </Box>
              <Title order={1} size="h2" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                欢迎回来，{user?.user_metadata?.full_name || user?.email?.split('@')[0] || '旅行者'}！
              </Title>
            </Group>
            <Text size="lg" c="dimmed">
              今天想去哪里探索？
            </Text>
          </Stack>
          <Button
            size="lg"
            gradient={{ from: 'blue', to: 'purple' }}
            leftSection={<Plus size={20} />}
            onClick={() => setShowCreateModal(true)}
            radius="xl"
            style={{
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}
          >
            分享动态
          </Button>
        </Group>
      </Paper>

        {/* Quick Search */}
        <Paper p="lg" mb="xl" radius="xl" style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <TextInput
            size="xl"
            radius="xl"
            placeholder="向AI助手询问旅行建议，或分享你的想法..."
            leftSection={<Search size={20} />}
            mb="md"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                fontSize: '16px'
              }
            }}
          />
          
          {/* Popular Tags */}
          <Group gap="xs" justify="center">
            <Text size="sm" c="dimmed" mr="sm">热门标签：</Text>
            {['东京', '巴厘岛', '巴黎', '纽约', '泰国'].map((tag) => (
              <Badge 
                key={tag} 
                variant="light" 
                size="md" 
                style={{ cursor: 'pointer' }} 
                radius="xl"
                gradient={{ from: 'blue', to: 'purple' }}
              >
                #{tag}
              </Badge>
            ))}
          </Group>
          
          {/* Action Buttons */}
          <Group justify="center" gap="md" mt="lg">
            <Button
              leftSection={<Plus size={16} />}
              variant="light"
              radius="xl"
              onClick={() => setShowCreateModal(true)}
            >
              发布动态
            </Button>
            <Button
              variant="outline"
              radius="xl"
            >
              开启AI助手
            </Button>
          </Group>
        </Paper>

        {/* Filter Tabs */}
        <Group justify="center" mb="xl">
          <Paper radius="xl" p="xs" style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Group gap="xs">
              {['🔥 热门推荐', '👥 关注', '⭐ 热门', '🆕 最新', '📍 附近'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'gradient' : 'subtle'}
                  gradient={selectedFilter === filter ? { from: 'blue', to: 'purple' } : undefined}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  radius="xl"
                  style={{
                    fontWeight: selectedFilter === filter ? 600 : 500
                  }}
                >
                  {filter}
                </Button>
              ))}
            </Group>
          </Paper>
        </Group>

        {/* Main Content Grid */}
        <Grid>
          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Stack gap="lg" style={{ position: 'sticky', top: '2rem' }}>
              {/* Popular Destinations */}
              <Paper p="lg" radius="xl" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <Group justify="space-between" align="center" mb="md">
                  <Title order={3} size="h4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>🌍 热门目的地</Title>
                  <Text size="sm" c="blue" style={{ cursor: 'pointer' }}>查看更多</Text>
                </Group>
              <Stack gap="sm">
                {destinations.slice(0, 5).map((destination) => (
                  <Group key={destination.id} gap="sm" style={{ cursor: 'pointer' }}>
                    <img
                      src={destination.image}
                      alt={destination.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>{destination.name}</Text>
                      <Group gap="xs">
                        <Star size={12} style={{ color: 'var(--mantine-color-yellow-6)', fill: 'currentColor' }} />
                        <Text size="xs" c="dimmed">{destination.rating}</Text>
                      </Group>
                    </Stack>
                  </Group>
                ))}
              </Stack>
            </Paper>

              {/* Weather Widget */}
              <Paper p="lg" radius="xl" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <Title order={3} size="h4" mb="md" c="white">☀️ 今日天气</Title>
                <Group justify="space-between" align="center">
                  <Stack gap={4}>
                    <Text size="xl" fw={700} c="white">22°C</Text>
                    <Text size="sm" opacity={0.8} c="white">晴朗</Text>
                  </Stack>
                  <Text style={{ fontSize: '48px' }}>☀️</Text>
                </Group>
                <Text size="sm" mt="sm" opacity={0.8} c="white">适合户外活动</Text>
              </Paper>
              
              {/* Quick Actions */}
              <Paper p="lg" radius="xl" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <Title order={3} size="h4" mb="md" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>📸 快速操作</Title>
                <Stack gap="sm">
                  <Button
                    variant="light"
                    leftSection={<Image size={16} />}
                    fullWidth
                    radius="lg"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    分享照片
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<Video size={16} />}
                    fullWidth
                    radius="lg"
                    style={{ justifyContent: 'flex-start' }}
                    color="red"
                  >
                    上传视频
                  </Button>
                </Stack>
              </Paper>
          </Stack>
        </Grid.Col>

          {/* Main Content */}
          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Stack gap="xl">
              {/* Location Based Content */}
              <LocationBasedContent />
              
              {/* Featured Content */}
              <Stack gap="lg">
                {featuredContent.map((content) => (
                  <Paper key={content.id} p="lg" radius="xl" style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                  <Group mb="md">
                    <Avatar src={content.author.avatar} size="md" radius="lg" />
                    <Stack gap={4}>
                      <Text fw={500}>{content.author.name}</Text>
                      <Text size="sm" c="dimmed">{content.location}</Text>
                    </Stack>
                  </Group>
                  
                  <Title order={3} size="h4" mb="md">{content.title}</Title>
                  
                  <div style={{ aspectRatio: '16/9', marginBottom: '16px' }}>
                    <img
                      src={content.image}
                      alt={content.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                  
                  <Group justify="space-between">
                    <Group gap="xl">
                      <ActionIcon.Group>
                        <ActionIcon variant="subtle" size="lg">
                          <Heart size={18} />
                        </ActionIcon>
                        <Text size="sm" ml={4}>{formatNumber(content.likes)}</Text>
                      </ActionIcon.Group>
                      <ActionIcon.Group>
                        <ActionIcon variant="subtle" size="lg">
                          <MessageCircle size={18} />
                        </ActionIcon>
                        <Text size="sm" ml={4}>{formatNumber(content.comments)}</Text>
                      </ActionIcon.Group>
                    </Group>
                    <ActionIcon variant="subtle" size="lg">
                      <Globe size={18} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>

              {/* Load More */}
              <Group justify="center">
                <Button 
                  variant="gradient" 
                  gradient={{ from: 'blue', to: 'purple' }}
                  size="lg" 
                  radius="xl"
                  style={{
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  加载更多
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(postData) => console.log('New post:', postData)}
      />
      </Container>
  );
};

export default Home;