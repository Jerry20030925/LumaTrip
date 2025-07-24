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
  Alert,
  ActionIcon
} from '@mantine/core';
import {
  MessageCircle,
  Send,
  Check,
  Bug,
  Lightbulb,
  ThumbsUp,
  Star,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feedbackService, type Feedback } from '../services/feedback.service';
import { useAuth } from '../hooks/useAuth';

const Support: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    content: '',
    rating: 5
  });

  // 加载用户反馈
  useEffect(() => {
    loadUserFeedbacks();
  }, []);

  const loadUserFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      let userEmail = user?.email;
      
      if (!userEmail) {
        console.log('用户未登录，使用测试邮箱');
        userEmail = 'test@example.com';
      }
      
      const feedbacks = await feedbackService.getUserFeedbacks(userEmail);
      console.log('加载到的反馈:', feedbacks);
      setMyFeedbacks(feedbacks);
    } catch (error) {
      console.error('加载用户反馈失败:', error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleSubmit = async () => {
    console.log('提交反馈 - 用户信息:', user);
    console.log('提交反馈 - 表单数据:', formData);
    
    if (!formData.content.trim()) {
      console.log('内容为空，无法提交');
      return;
    }
    
    if (!user?.email) {
      console.log('用户未登录或邮箱为空');
      // 使用模拟用户数据
      const mockUser = {
        email: 'test@example.com',
        user_metadata: { full_name: '测试用户' }
      };
      
      setLoading(true);
      
      try {
        const newFeedback = await feedbackService.submitFeedback({
          type: formData.type as any,
          title: formData.title || '用户反馈',
          content: formData.content,
          userEmail: mockUser.email,
          userName: mockUser.user_metadata.full_name,
          status: 'pending',
          rating: formData.type === 'compliment' ? formData.rating : undefined
        });

        if (newFeedback) {
          setMyFeedbacks(prev => [newFeedback, ...prev]);
          setSubmitted(true);
          setFormData({ type: 'general', title: '', content: '', rating: 5 });
          
          setTimeout(() => setSubmitted(false), 3000);
        }
      } catch (error) {
        console.error('提交反馈失败:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    
    try {
      const newFeedback = await feedbackService.submitFeedback({
        type: formData.type as any,
        title: formData.title || '用户反馈',
        content: formData.content,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.email.split('@')[0],
        status: 'pending',
        rating: formData.type === 'compliment' ? formData.rating : undefined
      });

      if (newFeedback) {
        setMyFeedbacks(prev => [newFeedback, ...prev]);
        setSubmitted(true);
        setFormData({ type: 'general', title: '', content: '', rating: 5 });
        
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      setLoading(false);
    }
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
          <Group justify="space-between">
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

          {/* 右侧：我的反馈列表 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="xl" radius="xl" shadow="sm">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>我的反馈</Title>
                  <Badge variant="light" color="blue">
                    {myFeedbacks.length} 条
                  </Badge>
                </Group>

                <Stack gap="sm" mah={600} style={{ overflowY: 'auto' }}>
                  {loadingFeedbacks ? (
                    <Paper p="xl" radius="lg" style={{ textAlign: 'center' }}>
                      <Stack gap="md">
                        <Text size="lg" c="dimmed">加载中...</Text>
                      </Stack>
                    </Paper>
                  ) : myFeedbacks.length === 0 ? (
                    <Paper p="xl" radius="lg" style={{ textAlign: 'center' }}>
                      <Stack gap="md">
                        <MessageCircle size={48} style={{ color: '#9ca3af', margin: '0 auto' }} />
                        <Text size="lg" c="dimmed">
                          您还没有提交任何反馈
                        </Text>
                        <Text size="sm" c="dimmed">
                          有任何问题或建议，请在左侧表单中提交反馈
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    myFeedbacks.map((feedback) => (
                      <Card key={feedback.id} padding="md" radius="lg" withBorder>
                        <Stack gap="xs">
                          {/* 头部信息 */}
                          <Group justify="space-between">
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

                          {/* 开发者回复 */}
                          {feedback.response && (
                            <Paper p="md" radius="md" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                              <Group gap="xs" mb="xs">
                                <MessageCircle size={12} />
                                <Text size="xs" fw={500} c="blue">开发者回复:</Text>
                              </Group>
                              <Text size="xs">{feedback.response}</Text>
                            </Paper>
                          )}
                        </Stack>
                      </Card>
                    ))
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