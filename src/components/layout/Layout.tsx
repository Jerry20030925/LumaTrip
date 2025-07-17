import { Outlet } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding={0}
      style={{ 
        backgroundColor: 'transparent',
        background: 'none'
      }}
    >
      <Header />
      <AppShell.Main style={{ 
        backgroundColor: 'transparent',
        background: 'none',
        padding: 0,
        width: '100%'
      }}>
        <Outlet />
      </AppShell.Main>
      <Footer />
    </AppShell>
  );
};

export default Layout;