import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { index: true, element: <Login /> },
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
];

const router = createBrowserRouter(routes);

export default router;