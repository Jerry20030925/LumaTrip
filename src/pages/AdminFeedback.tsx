import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Card,
  Badge,
  Select,
  TextInput,
  ActionIcon,
  Modal,
  Textarea,
  Alert,
  Avatar,
  Menu
} from '@mantine/core';
import {
  MessageCircle,
  Bug,
  Lightbulb,
  ThumbsUp,
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  Reply,
  Settings,
  BarChart3
} from 'lucide-react';
import { feedbackService, type Feedback } from '../services/feedback.service';

const AdminFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseModalOpened, setResponseModalOpened] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 模拟开发者检查（实际应用中应该从认证系统获取）
  const isAdmin = true; // 这里应该从实际的用户权限系统获取

  // 加载所有反馈
  useEffect(() => {
    loadAllFeedbacks();
  }, []);

  const loadAllFeedbacks = async () => {
    setLoading(true);
    try {
      const allFeedbacks = await feedbackService.getAllFeedbacks();
      setFeedbacks(allFeedbacks);
      setFilteredFeedbacks(allFeedbacks);
    } catch (error) {
      console.error('加载反馈失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤反馈
  useEffect(() => {
    let filtered = feedbacks;

    // 按状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    // 按类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.type === typeFilter);
    }

    // 按搜索关键词过滤
    if (searchQuery.trim()) {
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, statusFilter, typeFilter, searchQuery]);

  // 权限检查
  if (!isAdmin) {
    return (
      <Container size="lg" px="md" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
        <Alert color="red" title="访问被拒绝">
          您没有权限访问此页面。此页面仅供系统管理员使用。
        </Alert>
      </Container>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug size={16} />;
      case 'feature': return <Lightbulb size={16} />;
      case 'compliment': return <ThumbsUp size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'red';
      case 'feature': return 'blue';
      case 'compliment': return 'green';
      default: return 'gray';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return '问题反馈';
      case 'feature': return '功能建议';
      case 'compliment': return '表扬';
      default: return '一般反馈';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'reviewed': return 'blue';
      case 'resolved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'reviewed': return '已查看';
      case 'resolved': return '已解决';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    const days = Math.floor(diffInHours / 24);
    return `${days}天前`;
  };

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    try {
      const success = await feedbackService.updateFeedbackStatus(feedbackId, newStatus);
      if (success) {
        setFeedbacks(prev => prev.map(f => 
          f.id === feedbackId ? { ...f, status: newStatus as any } : f
        ));
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleResponse = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
    setResponseModalOpened(true);
  };

  const submitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;
    
    try {
      const success = await feedbackService.replyToFeedback(selectedFeedback.id, responseText);
      if (success) {
        setFeedbacks(prev => prev.map(f => 
          f.id === selectedFeedback.id 
            ? { ...f, response: responseText, status: 'reviewed' }
            : f
        ));
        setResponseModalOpened(false);
        setResponseText('');
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('回复失败:', error);
    }
  };

  const getStats = () => {
    const total = feedbacks.length;
    const pending = feedbacks.filter(f => f.status === 'pending').length;
    const resolved = feedbacks.filter(f => f.status === 'resolved').length;
    const bugs = feedbacks.filter(f => f.type === 'bug').length;
    
    return { total, pending, resolved, bugs };
  };

  const stats = getStats();

  return (
    <Container size="xl" px="md" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
      <Stack gap="xl">
        {/* 头部 */}
        <Paper p="xl" radius="xl" shadow="sm" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 101, 101, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Group justify="space-between">
            <Stack gap="sm">
              <Group gap="sm">
                <Settings size={24} />
                <Title order={1} size="xl">开发者反馈管理</Title>
                <Badge color="red" variant="filled">管理员专用</Badge>
              </Group>
              <Text size="md" c="dimmed">
                管理和回复用户反馈，跟踪问题解决进度
              </Text>
            </Stack>
            
            <Group gap="md">
              <Card padding="md" radius="md">
                <Group gap="xs">
                  <BarChart3 size={16} />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">总反馈</Text>
                    <Text fw={600}>{stats.total}</Text>
                  </Stack>
                </Group>
              </Card>
              
              <Card padding="md" radius="md">
                <Group gap="xs">
                  <Badge color="yellow" size="sm" variant="dot" />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">待处理</Text>
                    <Text fw={600}>{stats.pending}</Text>
                  </Stack>
                </Group>
              </Card>
              
              <Card padding="md" radius="md">
                <Group gap="xs">
                  <Badge color="green" size="sm" variant="dot" />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">已解决</Text>
                    <Text fw={600}>{stats.resolved}</Text>
                  </Stack>
                </Group>
              </Card>
            </Group>
          </Group>
        </Paper>

        {/* 筛选和搜索 */}
        <Paper p="lg" radius="lg" shadow="sm">
          <Group justify="space-between">
            <Group gap="md">
              <TextInput
                placeholder="搜索反馈..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '300px' }}
              />
              
              <Select
                placeholder="状态"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: '全部状态' },
                  { value: 'pending', label: '待处理' },
                  { value: 'reviewed', label: '已查看' },
                  { value: 'resolved', label: '已解决' },
                  { value: 'rejected', label: '已拒绝' }
                ]}
              />
              
              <Select
                placeholder="类型"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value || 'all')}
                data={[
                  { value: 'all', label: '全部类型' },
                  { value: 'bug', label: '问题反馈' },
                  { value: 'feature', label: '功能建议' },
                  { value: 'general', label: '一般反馈' },
                  { value: 'compliment', label: '表扬' }
                ]}
              />
            </Group>
            
            <Group gap="xs">
              <ActionIcon variant="light">
                <Filter size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>

        {/* 反馈列表 */}
        <Stack gap="md">
          {loading ? (
            <Paper p="xl" radius="lg" style={{ textAlign: 'center' }}>
              <Text size="lg" c="dimmed">加载中...</Text>
            </Paper>
          ) : filteredFeedbacks.length === 0 ? (
            <Paper p="xl" radius="lg" style={{ textAlign: 'center' }}>
              <Text size="lg" c="dimmed">
                没有找到匹配的反馈
              </Text>
            </Paper>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <Card key={feedback.id} padding="lg" radius="lg" withBorder>
                <Stack gap="md">
                  {/* 头部信息 */}
                  <Group justify="space-between">
                    <Group gap="md">
                      <Group gap="xs">
                        <Badge
                          leftSection={getTypeIcon(feedback.type)}
                          color={getTypeColor(feedback.type)}
                          variant="light"
                        >
                          {getTypeLabel(feedback.type)}
                        </Badge>
                        
                        <Badge
                          color={getStatusColor(feedback.status)}
                          variant="dot"
                        >
                          {getStatusLabel(feedback.status)}
                        </Badge>
                        
                        {feedback.priority && (
                          <Badge
                            color={getPriorityColor(feedback.priority)}
                            variant="outline"
                            size="sm"
                          >
                            {feedback.priority}
                          </Badge>
                        )}
                      </Group>
                      
                      <Group gap="xs">
                        <Avatar size="sm" />
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{feedback.userName}</Text>
                          <Text size="xs" c="dimmed">{feedback.userEmail}</Text>
                        </Stack>
                      </Group>
                    </Group>
                    
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        {formatTimeAgo(feedback.createdAt)}
                      </Text>
                      
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<Eye size={14} />}
                            onClick={() => handleResponse(feedback)}
                          >
                            查看详情
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<Reply size={14} />}
                            onClick={() => handleResponse(feedback)}
                          >
                            回复
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<CheckCircle size={14} />}
                            onClick={() => handleStatusChange(feedback.id, 'resolved')}
                          >
                            标记为已解决
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<XCircle size={14} />}
                            onClick={() => handleStatusChange(feedback.id, 'rejected')}
                            color="red"
                          >
                            标记为已拒绝
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>

                  {/* 反馈内容 */}
                  <Stack gap="xs">
                    <Text fw={500} size="md">{feedback.title}</Text>
                    <Text size="sm" c="dimmed">
                      {feedback.content}
                    </Text>
                    
                    {/* 标签 */}
                    {feedback.tags && feedback.tags.length > 0 && (
                      <Group gap="xs">
                        {feedback.tags.map((tag, index) => (
                          <Badge key={index} size="xs" variant="light">
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    )}
                    
                    {/* 评分 */}
                    {feedback.rating && (
                      <Group gap="xs">
                        {[...Array(feedback.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" style={{ color: '#ffd43b' }} />
                        ))}
                      </Group>
                    )}
                    
                    {/* 指派信息 */}
                    {feedback.assignedTo && (
                      <Text size="xs" c="dimmed">
                        指派给: {feedback.assignedTo}
                      </Text>
                    )}
                    
                    {/* 开发者回复 */}
                    {feedback.response && (
                      <Paper p="md" radius="md" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                        <Group gap="xs" mb="xs">
                          <Reply size={14} />
                          <Text size="sm" fw={500}>开发者回复:</Text>
                        </Group>
                        <Text size="sm">{feedback.response}</Text>
                      </Paper>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))
          )}
        </Stack>

        {/* 回复模态框 */}
        <Modal
          opened={responseModalOpened}
          onClose={() => setResponseModalOpened(false)}
          title="回复用户反馈"
          size="lg"
        >
          {selectedFeedback && (
            <Stack gap="md">
              <Paper p="md" radius="md" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <Badge color={getTypeColor(selectedFeedback.type)} variant="light">
                      {getTypeLabel(selectedFeedback.type)}
                    </Badge>
                    <Text fw={500}>{selectedFeedback.title}</Text>
                  </Group>
                  <Text size="sm">{selectedFeedback.content}</Text>
                  <Text size="xs" c="dimmed">
                    来自: {selectedFeedback.userName} ({selectedFeedback.userEmail})
                  </Text>
                </Stack>
              </Paper>
              
              <Textarea
                label="回复内容"
                placeholder="输入您的回复..."
                rows={6}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
              
              <Group justify="flex-end">
                <Button variant="outline" onClick={() => setResponseModalOpened(false)}>
                  取消
                </Button>
                <Button onClick={submitResponse} disabled={!responseText.trim()}>
                  发送回复
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default AdminFeedback; 