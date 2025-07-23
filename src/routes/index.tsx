import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LandingPage from '../pages/LandingPage';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Messages from '../pages/Messages';
import Settings from '../pages/Settings';
import Discover from '../pages/Discover';
import Notifications from '../pages/Notifications';
import SearchPage from '../components/search/SearchPage';
import DebugPage from '../pages/DebugPage';
import AuthCallback from '../pages/AuthCallback';
import MapExample from '../pages/MapExample';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ErrorBoundary from '../components/ErrorBoundary';

const routes: RouteObject[] = [
  // Landing Page (no layout)
  {
    path: '/',
    element: <LandingPage />,
  },
  // App routes with layout
  {
    path: '/app',
    element: <Layout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'home', element: <Home /> },
          { path: 'discover', element: <Discover /> },
          // { path: '/discover/:postId', element: <PostDetails /> },
          { path: 'messages', element: <Messages /> },
          // { path: '/messages/:roomId', element: <ChatRoom /> },
          { path: 'profile', element: <Profile /> },
          { path: 'profile/:userId', element: <Profile /> },
          { path: 'settings', element: <Settings /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'map-example', element: <MapExample /> },
        ],
      },
    ],
  },
  // OAuth 回调页面 - 不需要认证
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  // 调试页面 - 不需要认证
  {
    path: '/debug',
    element: <DebugPage />,
  },
  // 地图示例页面 - 不需要认证（方便演示）
  {
    path: '/map-demo',
    element: <MapExample />,
  },
  // 捕获所有未匹配的路径
  {
    path: '*',
    element: (
      <ErrorBoundary>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1>404 - 页面未找到</h1>
          <p>抱歉，您访问的页面不存在。</p>
          <div style={{ marginTop: '20px' }}>
            <a href="/" style={{ color: 'yellow', textDecoration: 'underline', marginRight: '20px' }}>
              返回首页
            </a>
            <a href="/app/home" style={{ color: 'yellow', textDecoration: 'underline' }}>
              前往主页
            </a>
          </div>
        </div>
      </ErrorBoundary>
    ),
  },
];

const router = createBrowserRouter(routes);

export default router;