import React, { useState } from 'react';
import {
  Card,
  Text,
  Stack,
  Group,
  TextInput,
  ActionIcon,
  Alert,
  Title
} from '@mantine/core';
import { 
  IconShare, 
  IconCopy, 
  IconCheck, 
  IconQrcode,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconMail
} from '@tabler/icons-react';

interface ProfileLinkShareProps {
  userId: string;
  displayName: string;
}

const ProfileLinkShare: React.FC<ProfileLinkShareProps> = ({
  userId,
  displayName
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const profileUrl = `${window.location.origin}/profile/${userId}`;
  const inviteUrl = `${window.location.origin}/invite/${userId}`;
  
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };
  
  const handleShare = (platform: string, url: string) => {
    const text = `来看看 ${displayName} 的个人主页！`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('邀请加入 LumaTrip')}&body=${encodeURIComponent(text + '\n\n' + url)}`);
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'LumaTrip - ' + displayName,
            text: text,
            url: url
          });
        }
    }
  };
  
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <IconShare size={20} color="#4682B4" />
          <Title order={4}>分享个人主页</Title>
        </Group>
        
        {/* Profile Link */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>个人主页链接</Text>
          <Group gap="xs">
            <TextInput
              value={profileUrl}
              readOnly
              size="sm"
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="light"
              color={copied ? 'green' : 'blue'}
              onClick={() => handleCopyLink(profileUrl)}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Group>
          <Text size="xs" c="dimmed">
            其他用户可以通过此链接查看您的个人主页
          </Text>
        </Stack>
        
        {/* Invite Link */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>邀请注册链接</Text>
          <Group gap="xs">
            <TextInput
              value={inviteUrl}
              readOnly
              size="sm"
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="light"
              color={copied ? 'green' : 'blue'}
              onClick={() => handleCopyLink(inviteUrl)}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Group>
          <Text size="xs" c="dimmed">
            通过此链接注册的用户将自动成为您的好友
          </Text>
        </Stack>
        
        {/* Quick Share Buttons */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>快速分享</Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="green"
              size="lg"
              onClick={() => handleShare('whatsapp', inviteUrl)}
            >
              <IconBrandWhatsapp size={20} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              onClick={() => handleShare('telegram', inviteUrl)}
            >
              <IconBrandTelegram size={20} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={() => handleShare('email', inviteUrl)}
            >
              <IconMail size={20} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="gray"
              size="lg"
              onClick={() => setShowQR(!showQR)}
            >
              <IconQrcode size={20} />
            </ActionIcon>
          </Group>
        </Stack>
        
        {/* QR Code Placeholder */}
        {showQR && (
          <Stack gap="xs" align="center">
            <Text size="sm" fw={500}>二维码</Text>
            <div
              style={{
                width: 150,
                height: 150,
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Stack align="center" gap="xs">
                <IconQrcode size={40} color="#adb5bd" />
                <Text size="xs" c="dimmed" ta="center">
                  二维码功能
                  <br />
                  开发中
                </Text>
              </Stack>
            </div>
            <Text size="xs" c="dimmed" ta="center">
              扫描二维码快速访问个人主页
            </Text>
          </Stack>
        )}
        
        {copied && (
          <Alert
            icon={<IconCheck size={16} />}
            title="复制成功"
            color="green"
          >
            链接已复制到剪贴板
          </Alert>
        )}
      </Stack>
    </Card>
  );
};

export default ProfileLinkShare;