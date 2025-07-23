import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, Box, Container } from '@mantine/core';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showDecorations?: boolean;
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullHeight?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  showDecorations = true,
  containerSize = 'xl',
  fullHeight = true
}) => {
  return (
    <Box style={{
      minHeight: fullHeight ? '100vh' : 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      {showDecorations && (
        <>
          <Box
            pos="absolute"
            top={-50}
            right={-50}
            w={200}
            h={200}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              zIndex: 0
            }}
          />
          <Box
            pos="absolute"
            bottom={-30}
            left={-30}
            w={150}
            h={150}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              filter: 'blur(30px)',
              zIndex: 0
            }}
          />
        </>
      )}
      
      <AppShell
        header={showHeader ? { height: 60 } : undefined}
        footer={showFooter ? { height: 60 } : undefined}
        padding={0}
        style={{ 
          backgroundColor: 'transparent',
          background: 'none'
        }}
      >
        {showHeader && <Header />}
        <AppShell.Main style={{ 
          backgroundColor: 'transparent',
          background: 'none',
          padding: 0,
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          <Container size={containerSize} px="md" style={{ 
            position: 'relative', 
            zIndex: 1,
            paddingTop: showHeader ? '2rem' : '0'
          }}>
            {children || <Outlet />}
          </Container>
        </AppShell.Main>
        {showFooter && <Footer />}
      </AppShell>
    </Box>
  );
};

export default Layout;