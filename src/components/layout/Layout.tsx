import { Outlet } from 'react-router-dom';
import { AppShell, Container, Space } from '@mantine/core';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
      style={{ 
        backgroundColor: 'transparent',
        background: 'none'
      }}
    >
      <Header />
      <AppShell.Main style={{ 
        backgroundColor: 'transparent',
        background: 'none'
      }}>
        <Container style={{ 
          backgroundColor: 'transparent',
          background: 'none',
          height: '100%'
        }}>
          <Space h="md" />
          <Outlet />
          <Space h="md" />
        </Container>
      </AppShell.Main>
      <Footer />
    </AppShell>
  );
};

export default Layout;