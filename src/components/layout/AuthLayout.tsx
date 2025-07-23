import React from 'react';
import { Box, Center, Paper, Stack, Title, Text, Group } from '@mantine/core';
import { Globe } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = '欢迎',
  subtitle = '请登录您的账户',
  showLogo = true
}) => {
  return (
    <Box style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <Box
        pos="absolute"
        top={-100}
        right={-100}
        w={300}
        h={300}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />
      <Box
        pos="absolute"
        bottom={-50}
        left={-50}
        w={200}
        h={200}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Center style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Paper
          shadow="xl"
          radius="xl"
          p="xl"
          maw={400}
          w="100%"
          mx="md"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Stack gap="lg">
            {/* Logo and Header */}
            {showLogo && (
              <Stack gap="md" align="center">
                <Group gap="sm">
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
                    <Globe size={20} style={{ color: 'white' }} />
                  </Box>
                  <Title 
                    order={2} 
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    LumaTrip
                  </Title>
                </Group>
                <Stack gap="xs" align="center">
                  <Title order={3} ta="center">{title}</Title>
                  <Text size="md" c="dimmed" ta="center">{subtitle}</Text>
                </Stack>
              </Stack>
            )}
            
            {/* Content */}
            {children}
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
};

export default AuthLayout;