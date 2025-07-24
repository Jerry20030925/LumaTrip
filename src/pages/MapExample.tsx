import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Alert
} from '@mantine/core';
import AppleMap from '../components/maps/AppleMap';

const MapExample: React.FC = () => {
  const [mapCenter] = useState<{ latitude: number; longitude: number }>({
    latitude: 39.9042,
    longitude: 116.4074 // 北京
  });
  const [mapError, setMapError] = useState<string | null>(null);

  const handleMapLoad = () => {
    console.log('Apple Map loaded successfully');
    setMapError(null);
  };

  const handleMapError = (error: string) => {
    console.error('Apple Map error:', error);
    setMapError(error);
  };

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="lg">
        <Stack gap="lg">
          {/* 标题 */}
          <Group justify="space-between" align="center">
            <Title order={1}>🗺️ 地图探索</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">🍎 苹果地图</Text>
            </Group>
          </Group>

          {/* 错误提示 */}
          {mapError && (
            <Alert icon={<AlertCircle size={16} />} color="red" title="地图错误">
              <Text>{mapError}</Text>
            </Alert>
          )}

          {/* 地图容器 */}
          <div style={{ position: 'relative', height: '600px', borderRadius: '8px', overflow: 'hidden' }}>
            <AppleMap
              center={mapCenter}
              style={{ width: '100%', height: '100%' }}
              onMapLoad={handleMapLoad}
              onMapError={handleMapError}
            />

            {/* 地图控制按钮 - 现在由苹果地图组件内部处理 */}
          </div>

          {/* 地图信息 */}
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text fw={500}>地图信息</Text>
              <Text size="sm" c="dimmed">
                当前位置: {mapCenter.latitude.toFixed(4)}, {mapCenter.longitude.toFixed(4)}
              </Text>
              <Text size="sm" c="dimmed">
                缩放级别: 自适应
              </Text>
              <Text size="sm" c="dimmed">
                状态: 苹果地图已就绪 ✅
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
};

export default MapExample; 