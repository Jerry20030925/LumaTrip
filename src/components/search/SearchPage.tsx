import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextInput,
  Group,
  Stack,
  Title,
  Text,
  Tabs,
  Badge,
  Card,
  Avatar,
  ActionIcon,
  Button,
  Center,
  Box,
  Image
} from '@mantine/core';
import { 
  Search, 
  User, 
  FileText, 
  Hash, 
  MapPin, 
  Filter, 
  Clock, 
  TrendingUp,
  Heart,
  MessageCircle
} from 'lucide-react';
import SearchHistory from './SearchHistory';
import { 
  search, 
  getTrendingTags, 
  getSearchHistory, 
  type SearchResult, 
  type SearchFilters 
} from '../../services/search.service';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [searchFilters] = useState<SearchFilters>({});

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [trending, history] = await Promise.all([
          getTrendingTags(6),
          getSearchHistory()
        ]);
        setTrendingTags(trending);
        setRecentSearches(history);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Fallback to mock data
        setRecentSearches(['巴厘岛', '樱花', '旅行摄影', '美食推荐']);
        setTrendingTags(['#巴厘岛', '#樱花季', '#美食', '#旅行', '#摄影', '#自然风光']);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const searchResults = await search(query, activeTab as any, searchFilters);
      setResults(searchResults);
      
      // Update recent searches
      const updatedHistory = await getSearchHistory();
      setRecentSearches(updatedHistory);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTabResults = () => {
    if (activeTab === 'all') return results;
    return results.filter(result => result.type === activeTab);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User size={16} />;
      case 'post':
        return <FileText size={16} />;
      case 'tag':
        return <Hash size={16} />;
      case 'location':
        return <MapPin size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" radius="xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="md">
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
                <Search size={20} style={{ color: 'white' }} />
              </Box>
              <Title order={2} size="h3">发现更多</Title>
            </Group>
            
            <Group gap="xs">
              <ActionIcon 
                variant={showFilters ? 'filled' : 'subtle'} 
                size="lg" 
                radius="xl"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
              </ActionIcon>
              <ActionIcon 
                variant={showHistory ? 'filled' : 'subtle'} 
                size="lg" 
                radius="xl"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Clock size={18} />
              </ActionIcon>
            </Group>
          </Group>
          
          <TextInput
            size="lg"
            radius="xl"
            placeholder="搜索用户、帖子、标签或地点..."
            leftSection={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
            }}
            rightSection={
              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'purple' }}
                size="sm"
                radius="xl"
                onClick={() => handleSearch(searchQuery)}
                loading={loading}
              >
                搜索
              </Button>
            }
          />
        </Paper>

        {/* Filters */}
        {showFilters && (
          <Paper p="md" radius="xl" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div>高级搜索功能开发中...</div>
          </Paper>
        )}

        {/* Search History */}
        {showHistory && (
          <Paper p="md" radius="xl" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <SearchHistory
              recentSearches={recentSearches}
              onSearchClick={(query: string) => {
                setSearchQuery(query);
                handleSearch(query);
              }}
            />
          </Paper>
        )}

        {/* Default State - No Search Query */}
        {!searchQuery && (
          <Stack gap="lg">
            {/* Trending Tags */}
            <Paper p="lg" radius="xl" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Group gap="md" mb="md">
                <TrendingUp size={20} />
                <Title order={3} size="h4">热门标签</Title>
              </Group>
              <Group gap="xs">
                {trendingTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="light"
                    size="lg"
                    radius="xl"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSearchQuery(tag);
                      handleSearch(tag);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Paper>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Paper p="lg" radius="xl" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Group gap="md" mb="md">
                  <Clock size={20} />
                  <Title order={3} size="h4">最近搜索</Title>
                </Group>
                <Stack gap="xs">
                  {recentSearches.map((search) => (
                    <Group
                      key={search}
                      gap="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <Search size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <Text size="sm">{search}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}

        {/* Search Results */}
        {searchQuery && (
          <Stack gap="lg">
            {/* Tabs */}
            <Paper p="md" radius="xl" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
                <Tabs.List>
                  <Tabs.Tab value="all" leftSection={<Search size={16} />}>
                    全部 ({results.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="user" leftSection={<User size={16} />}>
                    用户 ({results.filter(r => r.type === 'user').length})
                  </Tabs.Tab>
                  <Tabs.Tab value="post" leftSection={<FileText size={16} />}>
                    帖子 ({results.filter(r => r.type === 'post').length})
                  </Tabs.Tab>
                  <Tabs.Tab value="tag" leftSection={<Hash size={16} />}>
                    标签 ({results.filter(r => r.type === 'tag').length})
                  </Tabs.Tab>
                  <Tabs.Tab value="location" leftSection={<MapPin size={16} />}>
                    地点 ({results.filter(r => r.type === 'location').length})
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Paper>

            {/* Results */}
            <Paper radius="xl" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {loading ? (
                <Center p="xl">
                  <Stack align="center" gap="md">
                    <Search size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
                    <Text c="dimmed">搜索中...</Text>
                  </Stack>
                </Center>
              ) : getTabResults().length === 0 ? (
                <Center p="xl">
                  <Stack align="center" gap="md">
                    <Search size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
                    <Text c="dimmed">没有找到相关结果</Text>
                    <Text size="sm" c="dimmed">
                      试试其他关键词或使用高级搜索
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <Stack gap="md" p="md">
                  {getTabResults().map((result) => (
                    <Card
                      key={result.id}
                      p="md"
                      radius="lg"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <Group gap="md">
                        {result.avatar && (
                          <Avatar src={result.avatar} size="md" radius="xl" />
                        )}
                        {result.image && !result.avatar && (
                          <Image
                            src={result.image}
                            alt={result.title}
                            width={60}
                            height={60}
                            radius="md"
                          />
                        )}
                        {!result.avatar && !result.image && (
                          <Box
                            style={{
                              width: 60,
                              height: 60,
                              backgroundColor: 'var(--mantine-color-gray-1)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {getResultIcon(result.type)}
                          </Box>
                        )}
                        
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text fw={500}>{result.title}</Text>
                            <Badge variant="light" size="xs" radius="xl">
                              {result.type === 'user' ? '用户' : 
                               result.type === 'post' ? '帖子' : 
                               result.type === 'tag' ? '标签' : '地点'}
                            </Badge>
                          </Group>
                          
                          {result.description && (
                            <Text size="sm" c="dimmed" lineClamp={2}>
                              {result.description}
                            </Text>
                          )}
                          
                          {result.location && (
                            <Group gap={4}>
                              <MapPin size={12} />
                              <Text size="xs" c="dimmed">{result.location}</Text>
                            </Group>
                          )}
                          
                          {result.tags && (
                            <Group gap={4}>
                              {result.tags.map((tag) => (
                                <Badge key={tag} variant="light" size="xs" radius="xl">
                                  {tag}
                                </Badge>
                              ))}
                            </Group>
                          )}
                          
                          {result.stats && (
                            <Group gap="lg">
                              {result.stats.likes && (
                                <Group gap={4}>
                                  <Heart size={12} />
                                  <Text size="xs" c="dimmed">
                                    {formatNumber(result.stats.likes)}
                                  </Text>
                                </Group>
                              )}
                              {result.stats.comments && (
                                <Group gap={4}>
                                  <MessageCircle size={12} />
                                  <Text size="xs" c="dimmed">
                                    {formatNumber(result.stats.comments)}
                                  </Text>
                                </Group>
                              )}
                              {result.stats.followers && (
                                <Group gap={4}>
                                  <User size={12} />
                                  <Text size="xs" c="dimmed">
                                    {formatNumber(result.stats.followers)} 关注者
                                  </Text>
                                </Group>
                              )}
                              {result.stats.posts && (
                                <Group gap={4}>
                                  <FileText size={12} />
                                  <Text size="xs" c="dimmed">
                                    {formatNumber(result.stats.posts)} 帖子
                                  </Text>
                                </Group>
                              )}
                            </Group>
                          )}
                        </Stack>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default SearchPage;