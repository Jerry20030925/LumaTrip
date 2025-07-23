import React, { useState } from 'react';
import {
  Card,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Alert,
  Badge,
  Title
} from '@mantine/core';
import { IconEdit, IconCheck, IconAlertCircle, IconId } from '@tabler/icons-react';

interface UserIdManagerProps {
  userId: string;
  remainingChanges: number;
  onUserIdChange: (newUserId: string) => Promise<boolean>;
}

const UserIdManager: React.FC<UserIdManagerProps> = ({
  userId,
  remainingChanges,
  onUserIdChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUserId, setNewUserId] = useState(userId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (newUserId === userId) {
      setIsEditing(false);
      return;
    }

    if (newUserId.length < 3) {
      setError('用户ID至少需要3个字符');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUserId)) {
      setError('用户ID只能包含字母、数字和下划线');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onUserIdChange(newUserId);
      if (success) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('该用户ID已被使用，请选择其他ID');
      }
    } catch {
      setError('修改失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewUserId(userId);
    setIsEditing(false);
    setError('');
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <IconId size={20} color="#4682B4" />
          <Title order={4}>用户ID管理</Title>
        </Group>
        
        {!isEditing ? (
          <>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">当前ID</Text>
              <Badge variant="light" color="blue">@{userId}</Badge>
            </Group>
            
            <Group justify="space-between">
              <Text size="sm" c="dimmed">剩余修改次数</Text>
              <Badge 
                variant="light" 
                color={remainingChanges > 0 ? 'green' : 'red'}
              >
                {remainingChanges}/5
              </Badge>
            </Group>
            
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={() => setIsEditing(true)}
              disabled={remainingChanges === 0}
              fullWidth
            >
              {remainingChanges > 0 ? '修改用户ID' : '已达修改上限'}
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="新用户ID"
              placeholder="输入新的用户ID"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              error={error}
              leftSection="@"
            />
            
            <Text size="xs" c="dimmed">
              • 3-20个字符
              • 只能包含字母、数字和下划线
              • 修改后一年内只能再修改{remainingChanges - 1}次
            </Text>
            
            <Group gap="xs">
              <Button
                variant="filled"
                onClick={handleSave}
                loading={isLoading}
                disabled={newUserId === userId}
                flex={1}
              >
                保存
              </Button>
              <Button
                variant="light"
                onClick={handleCancel}
                disabled={isLoading}
                flex={1}
              >
                取消
              </Button>
            </Group>
          </>
        )}
        
        {success && (
          <Alert
            icon={<IconCheck size={16} />}
            title="修改成功"
            color="green"
          >
            用户ID已成功修改为 @{userId}
          </Alert>
        )}
        
        {remainingChanges === 0 && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="修改次数已用完"
            color="orange"
          >
            您今年的用户ID修改次数已用完，请明年再试。
          </Alert>
        )}
      </Stack>
    </Card>
  );
};

export default UserIdManager;