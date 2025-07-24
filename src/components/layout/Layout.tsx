import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopHeader from './DesktopHeader';
import MobileNavigation from '../mobile/MobileNavigation';
import { useAuth } from '../../hooks/useAuth';

const Layout: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(768);
  const { user } = useAuth();

  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const isDesktop = windowWidth >= 768;

  return (
    <div className="page-container-primary min-h-screen">
      {/* 桌面端强制显示DesktopHeader */}
      {isDesktop && (
        <DesktopHeader user={user} />
      )}
      
      {/* 主要内容 */}
      <main 
        className="flex-1"
        style={{
          paddingTop: isDesktop ? '0' : '120px',
          paddingBottom: isDesktop ? '0' : '80px'
        }}
      >
        <Outlet />
      </main>
      
      {/* 移动端强制显示MobileNavigation */}
      {!isDesktop && <MobileNavigation />}
    </div>
  );
};

export default Layout;