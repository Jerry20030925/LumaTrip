import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Textarea,
  TextInput,
  Select,
  Card,
  Badge,
  Grid,
  Center,
  Alert,
  ActionIcon
} from '@mantine/core';
import {
  MessageCircle,
  Send,
  Check,
  HelpCircle,
  Bug,
  Lightbulb,
  ThumbsUp,
  Star,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'general' | 'compliment';
  title: string;
  content: string;
  userEmail: string;
  userName: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  rating?: number;
}

const Support: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);
  const [showMyFeedbacks, setShowMyFeedbacks] = useState(false);

  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    content: '',
    rating: 5
  });

  // 模拟获取反馈数据
  useEffect(() => {
    const mockFeedbacks: Feedback[] = [
      {
        id: '1',
        type: 'feature',
        title: '希望添加夜间模式',
        content: '能否添加一个夜间模式？长时间使用眼睛会疲劳。',
        userEmail: 'user1@example.com',
        userName: '旅行爱好者',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'reviewed'
      },
      {
        id: '2',
        type: 'bug',
        title: '地图加载缓慢',
        content: '地图页面打开后加载很慢，有时需要等待30秒以上。',
        userEmail: 'user2@example.com',
        userName: '探索者',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'resolved'
      },
      {
        id: '3',
        type: 'compliment',
        title: '界面设计很棒',
        content: '非常喜欢这个应用的界面设计，简洁美观，用户体验很好！',
        userEmail: 'user3@example.com',
        userName: '设计师小李',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'reviewed',
        rating: 5
      }
    ];

    setFeedbacks(mockFeedbacks);
    
    // 获取当前用户的反馈
    const userFeedbacks = mockFeedbacks.filter(f => f.userEmail === user?.email);
    setMyFeedbacks(userFeedbacks);
  }, [user]);

  const handleSubmit = async () => {
    if (!formData.content.trim()) return;

    setLoading(true);
    
    // 模拟提交反馈
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      type: formData.type as any,
      title: formData.title || '用户反馈',
      content: formData.content,
      userEmail: user?.email || 'anonymous@example.com',
      userName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '匿名用户',
      createdAt: new Date(),
      status: 'pending',
      rating: formData.type === 'compliment' ? formData.rating : undefined
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
    if (user?.email === newFeedback.userEmail) {
      setMyFeedbacks(prev => [newFeedback, ...prev]);
    }

    setSubmitted(true);
    setFormData({ type: 'general', title: '', content: '', rating: 5 });
    setLoading(false);

    // 3秒后重置提交状态
    setTimeout(() => setSubmitted(false), 3000);
  };

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
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'reviewed': return '已查看';
      case 'resolved': return '已解决';
      default: return '未知';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    return `${Math.floor(diffInHours / 24)}天前`;
  };

  return (
    <Container size="lg" px="md" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
      <Stack gap="xl">
        {/* 头部 */}
        <Paper p="xl" radius="xl" shadow="sm" style={{
          background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Group justify="space-between" align="flex-start">
            <Stack gap="sm">
              <Group gap="sm">
                <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
                  <ArrowLeft size={20} />
                </ActionIcon>
                <Title order={1} size="xl">反馈与支持</Title>
              </Group>
              <Text size="md" c="dimmed">
                您的反馈对我们非常重要，帮助我们持续改进LumaTrip的服务
              </Text>
            </Stack>
            <Group>
              <Button
                variant={showMyFeedbacks ? "filled" : "outline"}
                onClick={() => setShowMyFeedbacks(!showMyFeedbacks)}
                leftSection={<MessageCircle size={16} />}
              >
                {showMyFeedbacks ? '所有反馈' : '我的反馈'}
              </Button>
            </Group>
          </Group>
        </Paper>

        <Grid>
          {/* 左侧：提交反馈表单 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="xl" radius="xl" shadow="sm">
              <Stack gap="md">
                <Title order={3}>提交反馈</Title>
                
                {submitted && (
                  <Alert icon={<Check size={16} />} color="green" radius="md">
                    反馈提交成功！我们会尽快处理您的反馈。
                  </Alert>
                )}

                <Select
                  label="反馈类型"
                  value={formData.type}
                  onChange={(value) => setFormData(prev => ({ ...prev, type: value || 'general' }))}
                  data={[
                    { value: 'general', label: '一般反馈' },
                    { value: 'bug', label: '问题反馈' },
                    { value: 'feature', label: '功能建议' },
                    { value: 'compliment', label: '表扬' }
                  ]}
                />

                <TextInput
                  label="标题 (可选)"
                  placeholder="简要描述您的反馈..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />

                <Textarea
                  label="详细内容"
                  placeholder="请详细描述您的反馈、建议或遇到的问题..."
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                />

                {formData.type === 'compliment' && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">评分</Text>
                    <Group gap="xs">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <ActionIcon
                          key={rating}
                          variant={formData.rating >= rating ? "filled" : "outline"}
                          color="yellow"
                          onClick={() => setFormData(prev => ({ ...prev, rating }))}
                        >
                          <Star size={16} fill={formData.rating >= rating ? "currentColor" : "none"} />
                        </ActionIcon>
                      ))}
                    </Group>
                  </div>
                )}

                <Button
                  leftSection={<Send size={16} />}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!formData.content.trim()}
                  fullWidth
                >
                  提交反馈
                </Button>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* 右侧：反馈列表 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="xl" radius="xl" shadow="sm">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>
                    {showMyFeedbacks ? '我的反馈' : '最近反馈'}
                  </Title>
                  <Badge variant="light" color="blue">
                    {showMyFeedbacks ? myFeedbacks.length : feedbacks.length} 条
                  </Badge>
                </Group>

                <Stack gap="sm" mah={600} style={{ overflowY: 'auto' }}>
                  {(showMyFeedbacks ? myFeedbacks : feedbacks).map((feedback) => (
                    <Card key={feedback.id} padding="md" radius="lg" withBorder>
                      <Stack gap="xs">
                        {/* 头部信息 */}
                        <Group justify="space-between" align="flex-start">
                          <Group gap="xs">
                            <Badge
                              leftSection={getTypeIcon(feedback.type)}
                              color={getTypeColor(feedback.type)}
                              variant="light"
                              size="sm"
                            >
                              {getTypeLabel(feedback.type)}
                            </Badge>
                            <Badge
                              color={getStatusColor(feedback.status)}
                              variant="dot"
                              size="sm"
                            >
                              {getStatusLabel(feedback.status)}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {formatTimeAgo(feedback.createdAt)}
                          </Text>
                        </Group>

                        {/* 标题和内容 */}
                        <Text fw={500} size="sm">{feedback.title}</Text>
                        <Text size="xs" c="dimmed" lineClamp={3}>
                          {feedback.content}
                        </Text>

                        {/* 评分 */}
                        {feedback.rating && (
                          <Group gap="xs">
                            {[...Array(feedback.rating)].map((_, i) => (
                              <Star key={i} size={12} fill="currentColor" style={{ color: '#ffd43b' }} />
                            ))}
                          </Group>
                        )}

                        {/* 用户信息 */}
                        <Group gap="xs" mt="xs">
                          <Text size="xs" c="dimmed">
                            来自: {feedback.userName}
                          </Text>
                        </Group>
                      </Stack>
                    </Card>
                  ))}

                  {(showMyFeedbacks ? myFeedbacks : feedbacks).length === 0 && (
                    <Center py="xl">
                      <Stack align="center" gap="md">
                        <HelpCircle size={48} style={{ color: '#9ca3af' }} />
                        <Text size="lg" c="dimmed">
                          {showMyFeedbacks ? '您还没有提交任何反馈' : '暂无反馈记录'}
                        </Text>
                      </Stack>
                    </Center>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* 底部信息 */}
        <Paper p="lg" radius="lg" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
          <Stack gap="sm">
            <Title order={4}>联系我们</Title>
            <Text size="sm" c="dimmed">
              如果您有紧急问题或需要即时帮助，也可以通过以下方式联系我们：
            </Text>
            <Group gap="lg">
              <Text size="sm">📧 support@lumatrip.com</Text>
              <Text size="sm">📞 400-123-4567</Text>
              <Text size="sm">💬 在线客服 (9:00-18:00)</Text>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Support; 