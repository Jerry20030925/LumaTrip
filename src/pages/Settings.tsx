import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Switch,
  Select,
  Card,
  Divider,
  ActionIcon,
  Alert,
  Badge,
  Progress
} from '@mantine/core';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Database,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    // 通知设置
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    postLikes: true,
    postComments: true,
    newFollowers: true,
    systemUpdates: true,
    
    // 隐私设置
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowTagging: true,
    dataCollection: true,
    
    // 显示设置
    theme: 'auto',
    language: 'zh-CN',
    fontSize: 'medium',
    animations: true,
    
    // 其他设置
    autoSave: true,
    offlineMode: false,
    soundEffects: true,
    hapticFeedback: true,
    locationServices: true
  });

  const [storageUsage] = useState({
    total: 2048, // MB
    used: 512,   // MB
    cache: 128,  // MB
    images: 256, // MB
    data: 128    // MB
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const clearCache = () => {
    // 清除缓存逻辑
    console.log('Clearing cache...');
  };

  const exportData = () => {
    // 导出数据逻辑
    console.log('Exporting user data...');
  };

  const deleteAccount = () => {
    // 删除账户逻辑
    if (window.confirm('确定要删除账户吗？此操作不可恢复。')) {
      console.log('Deleting account...');
    }
  };

  return (
    <Container size="md" px="md" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
      <Stack gap="xl">
        {/* 头部 */}
        <Paper p="xl" radius="xl" shadow="sm" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Group gap="sm">
            <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={1} size="xl">设置</Title>
              <Text size="md" c="dimmed" mt="xs">
                管理您的账户设置和应用偏好
              </Text>
            </div>
          </Group>
        </Paper>

        {/* 账户设置 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <User size={20} />
              <Title order={3}>账户设置</Title>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>编辑个人资料</Text>
                <Text size="sm" c="dimmed">更新您的个人信息和头像</Text>
              </div>
              <Button variant="outline" onClick={() => navigate('/app/profile')}>
                编辑
              </Button>
            </Group>
            
            <Divider />
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>更改密码</Text>
                <Text size="sm" c="dimmed">为您的账户设置新密码</Text>
              </div>
              <Button variant="outline">
                更改
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 通知设置 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <Bell size={20} />
              <Title order={3}>通知设置</Title>
            </Group>
            
            <Stack gap="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>推送通知</Text>
                  <Text size="sm" c="dimmed">接收应用推送通知</Text>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.currentTarget.checked)}
                />
              </Group>
              
              <Group justify="space-between">
                <div>
                  <Text fw={500}>邮件通知</Text>
                  <Text size="sm" c="dimmed">接收邮件通知</Text>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.currentTarget.checked)}
                />
              </Group>
              
              <Group justify="space-between">
                <div>
                  <Text fw={500}>短信通知</Text>
                  <Text size="sm" c="dimmed">接收短信通知</Text>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.currentTarget.checked)}
                />
              </Group>
              
              <Divider />
              
              <Text size="sm" fw={500} c="dimmed">通知类型</Text>
              
              <Group justify="space-between">
                <Text size="sm">帖子点赞</Text>
                <Switch
                  size="sm"
                  checked={settings.postLikes}
                  onChange={(e) => handleSettingChange('postLikes', e.currentTarget.checked)}
                />
              </Group>
              
              <Group justify="space-between">
                <Text size="sm">帖子评论</Text>
                <Switch
                  size="sm"
                  checked={settings.postComments}
                  onChange={(e) => handleSettingChange('postComments', e.currentTarget.checked)}
                />
              </Group>
              
              <Group justify="space-between">
                <Text size="sm">新粉丝</Text>
                <Switch
                  size="sm"
                  checked={settings.newFollowers}
                  onChange={(e) => handleSettingChange('newFollowers', e.currentTarget.checked)}
                />
              </Group>
            </Stack>
          </Stack>
        </Card>

        {/* 隐私设置 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <Shield size={20} />
              <Title order={3}>隐私设置</Title>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>个人资料可见性</Text>
                <Text size="sm" c="dimmed">控制谁可以查看您的个人资料</Text>
              </div>
              <Select
                value={settings.profileVisibility}
                onChange={(value) => handleSettingChange('profileVisibility', value)}
                data={[
                  { value: 'public', label: '公开' },
                  { value: 'friends', label: '仅好友' },
                  { value: 'private', label: '私人' }
                ]}
                w={120}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>显示邮箱地址</Text>
                <Text size="sm" c="dimmed">在个人资料中显示邮箱</Text>
              </div>
              <Switch
                checked={settings.showEmail}
                onChange={(e) => handleSettingChange('showEmail', e.currentTarget.checked)}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>显示位置信息</Text>
                <Text size="sm" c="dimmed">在帖子中显示位置信息</Text>
              </div>
              <Switch
                checked={settings.showLocation}
                onChange={(e) => handleSettingChange('showLocation', e.currentTarget.checked)}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>允许标记</Text>
                <Text size="sm" c="dimmed">允许其他用户在帖子中标记您</Text>
              </div>
              <Switch
                checked={settings.allowTagging}
                onChange={(e) => handleSettingChange('allowTagging', e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Card>

        {/* 显示设置 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <Palette size={20} />
              <Title order={3}>显示设置</Title>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>主题</Text>
                <Text size="sm" c="dimmed">选择应用主题</Text>
              </div>
              <Select
                value={settings.theme}
                onChange={(value) => handleSettingChange('theme', value)}
                data={[
                  { value: 'light', label: '浅色' },
                  { value: 'dark', label: '深色' },
                  { value: 'auto', label: '跟随系统' }
                ]}
                w={120}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>语言</Text>
                <Text size="sm" c="dimmed">选择界面语言</Text>
              </div>
              <Select
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                data={[
                  { value: 'zh-CN', label: '简体中文' },
                  { value: 'zh-TW', label: '繁體中文' },
                  { value: 'en-US', label: 'English' },
                  { value: 'ja-JP', label: '日本語' }
                ]}
                w={120}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>字体大小</Text>
                <Text size="sm" c="dimmed">调整界面字体大小</Text>
              </div>
              <Select
                value={settings.fontSize}
                onChange={(value) => handleSettingChange('fontSize', value)}
                data={[
                  { value: 'small', label: '小' },
                  { value: 'medium', label: '中' },
                  { value: 'large', label: '大' }
                ]}
                w={120}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>动画效果</Text>
                <Text size="sm" c="dimmed">启用界面动画效果</Text>
              </div>
              <Switch
                checked={settings.animations}
                onChange={(e) => handleSettingChange('animations', e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Card>

        {/* 存储管理 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <Database size={20} />
              <Title order={3}>存储管理</Title>
            </Group>
            
            <div>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>存储使用情况</Text>
                <Text size="sm" c="dimmed">
                  {storageUsage.used} MB / {storageUsage.total} MB
                </Text>
              </Group>
              <Progress
                value={(storageUsage.used / storageUsage.total) * 100}
                size="lg"
                radius="xl"
                color="blue"
              />
            </div>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>清除缓存</Text>
                <Text size="sm" c="dimmed">释放 {storageUsage.cache} MB 存储空间</Text>
              </div>
              <Button variant="outline" onClick={clearCache}>
                清除
              </Button>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>离线模式</Text>
                <Text size="sm" c="dimmed">下载内容以供离线使用</Text>
              </div>
              <Switch
                checked={settings.offlineMode}
                onChange={(e) => handleSettingChange('offlineMode', e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Card>

        {/* 系统设置 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <Smartphone size={20} />
              <Title order={3}>系统设置</Title>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>音效</Text>
                <Text size="sm" c="dimmed">启用应用音效</Text>
              </div>
              <Switch
                checked={settings.soundEffects}
                onChange={(e) => handleSettingChange('soundEffects', e.currentTarget.checked)}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>触觉反馈</Text>
                <Text size="sm" c="dimmed">启用触觉反馈</Text>
              </div>
              <Switch
                checked={settings.hapticFeedback}
                onChange={(e) => handleSettingChange('hapticFeedback', e.currentTarget.checked)}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>位置服务</Text>
                <Text size="sm" c="dimmed">允许应用访问位置信息</Text>
              </div>
              <Switch
                checked={settings.locationServices}
                onChange={(e) => handleSettingChange('locationServices', e.currentTarget.checked)}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>自动保存</Text>
                <Text size="sm" c="dimmed">自动保存草稿和设置</Text>
              </div>
              <Switch
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Card>

        {/* 数据和隐私 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="md">
            <Group gap="sm">
              <Download size={20} />
              <Title order={3}>数据和隐私</Title>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>导出我的数据</Text>
                <Text size="sm" c="dimmed">下载您的所有数据</Text>
              </div>
              <Button variant="outline" onClick={exportData}>
                导出
              </Button>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={500}>数据收集</Text>
                <Text size="sm" c="dimmed">允许收集匿名使用数据以改进服务</Text>
              </div>
              <Switch
                checked={settings.dataCollection}
                onChange={(e) => handleSettingChange('dataCollection', e.currentTarget.checked)}
              />
            </Group>
            
            <Divider />
            
            <Alert color="red" radius="md">
              <Group justify="space-between">
                <div>
                  <Text fw={500} size="sm">删除账户</Text>
                  <Text size="xs" c="dimmed">永久删除您的账户和所有数据</Text>
                </div>
                <Button
                  color="red"
                  variant="outline"
                  size="sm"
                  leftSection={<Trash2 size={14} />}
                  onClick={deleteAccount}
                >
                  删除账户
                </Button>
              </Group>
            </Alert>
          </Stack>
        </Card>

        {/* 关于 */}
        <Card padding="xl" radius="xl" shadow="sm">
          <Stack gap="sm">
            <Title order={3}>关于LumaTrip</Title>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">版本</Text>
              <Badge variant="light">v1.0.0</Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">构建日期</Text>
              <Text size="sm">2024-01-24</Text>
            </Group>
            <Group gap="sm" mt="md">
              <Button variant="outline" size="sm">隐私政策</Button>
              <Button variant="outline" size="sm">服务条款</Button>
              <Button variant="outline" size="sm">开源许可</Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default Settings;