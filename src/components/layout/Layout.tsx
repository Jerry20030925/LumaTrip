import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNavigation from '../mobile/MobileNavigation';

const Layout: React.FC = () => {
  return (
    <div className="page-container-primary min-h-screen">
      {/* 桌面端/平板端顶部导航 */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* 主要内容 */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* 移动端导航（包含顶部和底部） */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default Layout;