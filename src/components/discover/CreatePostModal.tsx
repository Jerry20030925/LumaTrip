import React, { useState, useRef } from 'react';
import { X, Image, Video, MapPin, Hash, Smile, Send, Camera } from 'lucide-react';
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Select,
  Paper,
  SimpleGrid,
  CloseButton,
  Divider
} from '@mantine/core';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files].slice(0, 9); // 最多9张图片
    setSelectedFiles(newFiles);

    // 生成预览URL
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = tagInput.trim().replace('#', '');
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    
    const postData = {
      content: content.trim(),
      location,
      tags,
      privacy,
      files: selectedFiles,
      timestamp: new Date().toISOString()
    };

    try {
      await onSubmit(postData);
      // 重置表单
      setContent('');
      setLocation('');
      setTags([]);
      setTagInput('');
      setPrivacy('public');
      setSelectedFiles([]);
      setPreviewUrls([]);
      onClose();
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="创建新帖子"
      size="xl"
      centered
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* 文本内容 */}
          <Stack gap="xs">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的精彩时刻..."
              minRows={4}
              maxRows={8}
              maxLength={2000}
              radius="md"
              size="sm"
            />
            <Group justify="space-between">
              <Text size="xs" c="dimmed">{content.length}/2000</Text>
              <Group gap="xs">
                <ActionIcon variant="subtle" size="sm">
                  <Smile size={16} />
                </ActionIcon>
                <Text size="xs" c="blue">表情</Text>
              </Group>
            </Group>
          </Stack>

          {/* 图片/视频预览 */}
          {previewUrls.length > 0 && (
            <SimpleGrid cols={3} spacing="xs">
              {previewUrls.map((url, index) => (
                <Paper key={index} pos="relative" radius="md" style={{ aspectRatio: '1' }}>
                  <img
                    src={url}
                    alt={`预览 ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <CloseButton
                    pos="absolute"
                    top={4}
                    right={4}
                    size="sm"
                    bg="red"
                    c="white"
                    onClick={() => removeFile(index)}
                    style={{ opacity: 0.9 }}
                  />
                </Paper>
              ))}
            </SimpleGrid>
          )}

          {/* 位置信息 */}
          <TextInput
            leftSection={<MapPin size={16} />}
            placeholder="添加位置信息"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            radius="md"
            size="sm"
          />

          {/* 话题标签 */}
          <Stack gap="xs">
            <TextInput
              leftSection={<Hash size={16} />}
              placeholder="添加话题标签 (按空格或回车添加)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              radius="md"
              size="sm"
            />
            {tags.length > 0 && (
              <Group gap="xs">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="light"
                    rightSection={
                      <ActionIcon
                        size="xs"
                        color="blue"
                        radius="xl"
                        variant="transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X size={10} />
                      </ActionIcon>
                    }
                    radius="xl"
                  >
                    #{tag}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>

          {/* 隐私设置 */}
          <Paper p="md" bg="gray.0" radius="md">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={500}>谁可以看到这条帖子？</Text>
              <Select
                value={privacy}
                onChange={(value) => setPrivacy(value as any)}
                data={[
                  { value: 'public', label: '🌍 公开' },
                  { value: 'friends', label: '👥 好友可见' },
                  { value: 'private', label: '🔒 仅自己可见' }
                ]}
                size="sm"
                radius="md"
                w={140}
              />
            </Group>
          </Paper>

          <Divider />
          
          {/* 底部工具栏 */}
          <Group justify="space-between">
            {/* 媒体按钮 */}
            <Group gap="xs">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e)}
                style={{ display: 'none' }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e)}
                style={{ display: 'none' }}
              />
              
              <Button
                variant="subtle"
                leftSection={<Image size={16} />}
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                图片
              </Button>
              
              <Button
                variant="subtle"
                leftSection={<Video size={16} />}
                size="sm"
                onClick={() => videoInputRef.current?.click()}
              >
                视频
              </Button>
              
              <Button
                variant="subtle"
                leftSection={<Camera size={16} />}
                size="sm"
              >
                拍照
              </Button>
            </Group>

            {/* 发布按钮 */}
            <Button
              type="submit"
              leftSection={isSubmitting ? undefined : <Send size={16} />}
              loading={isSubmitting}
              disabled={(!content.trim() && selectedFiles.length === 0)}
              radius="md"
            >
              {isSubmitting ? '发布中...' : '发布'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreatePostModal;