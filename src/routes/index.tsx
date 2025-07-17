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
import SearchPage from '../components/search/SearchPage';
import DebugPage from '../pages/DebugPage';
import AuthCallback from '../pages/AuthCallback';
import MapExample from '../pages/MapExample';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

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
          { path: 'map-example', element: <MapExample /> },
          // { path: '/notifications', element: <Notifications /> },
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
];

const router = createBrowserRouter(routes);

export default router;