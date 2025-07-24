import React, { useState } from 'react';
import { Container, Paper, Title, Text, Alert, Button, Stack } from '@mantine/core';
import { AlertCircle, MapPin } from 'lucide-react';
import AppleMap from '../components/maps/AppleMap';

const AppleMapTest: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleMapLoad = () => {
    console.log('Apple Map loaded successfully');
    setIsMapLoaded(true);
  };

  const handleMapError = (errorMsg: string) => {
    console.error('Apple Map error:', errorMsg);
    setError(errorMsg);
  };

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="lg">
        <Title order={1} mb="lg">🍎 苹果地图测试页面</Title>
        
        <Stack gap="md">
          <Text c="dimmed">
            这是一个苹果地图测试页面，使用MapKit JS API
          </Text>

          {error ? (
            <Alert icon={<AlertCircle size={16} />} color="red" title="错误">
              <Text>{error}</Text>
              <Button 
                mt="md" 
                onClick={() => {
                  setError(null);
                  setIsMapLoaded(false);
                }}
              >
                重试
              </Button>
            </Alert>
          ) : (
            <div>
              <AppleMap
                center={{ latitude: 39.9042, longitude: 116.4074 }}
                zoom={12}
                style={{
                  width: '100%',
                  height: '500px',
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
                onMapLoad={handleMapLoad}
                onMapError={handleMapError}
              />
              
              {isMapLoaded && (
                <Alert icon={<MapPin size={16} />} color="green" title="成功" mt="md">
                  <Text>苹果地图加载成功！</Text>
                </Alert>
              )}
            </div>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default AppleMapTest; 