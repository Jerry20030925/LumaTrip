import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';

// 布局组件
import Layout from '../components/layout/Layout';

// 页面组件 - 懒加载
const Home = React.lazy(() => import('../pages/Home'));
const Discover = React.lazy(() => import('../pages/Discover'));
const Messages = React.lazy(() => import('../pages/Messages'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Support = React.lazy(() => import('../pages/Support'));
const MapExample = React.lazy(() => import('../pages/MapExample'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const DebugPage = React.lazy(() => import('../pages/DebugPage'));
const AuthDebugPage = React.lazy(() => import('../pages/AuthDebugPage'));
const AuthCallback = React.lazy(() => import('../pages/AuthCallback'));

// Loading 组件
const PageLoader = () => (
  <Center style={{ height: '100vh' }}>
    <Loader size="lg" />
  </Center>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 根路径重定向到首页 */}
        <Route path="/" element={<Navigate to="/app/home" replace />} />
        
        {/* 应用主要路由 */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
          <Route path="map-example" element={<MapExample />} />
        </Route>

        {/* 认证相关路由 */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="callback" element={<AuthCallback />} />
        </Route>

        {/* 调试页面 */}
        <Route path="/debug" element={<DebugPage />} />
        <Route path="/auth-debug" element={<AuthDebugPage />} />

        {/* 地图演示页面 */}
        <Route path="/map-demo" element={<MapExample />} />

        {/* 404 页面 */}
        <Route path="*" element={<Navigate to="/app/home" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;