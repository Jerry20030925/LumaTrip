import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconSearch, 
  IconBell, 
  IconChevronDown,
  IconHome,
  IconCompass,
  IconMap,
  IconMessage
} from '@tabler/icons-react';

interface DesktopHeaderProps {
  user?: {
    email?: string;
  };
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ user }) => {
  const location = useLocation();

  const navigationItems = [
    { to: '/app/home', icon: IconHome, label: '主页' },
    { to: '/app/discover', icon: IconCompass, label: '发现' },
    { to: '/app/map-example', icon: IconMap, label: '地图' },
    { to: '/app/messages', icon: IconMessage, label: '消息' }
  ];

  return (
    <header 
      style={{
        display: 'block',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px'
      }}>
        {/* Logo和品牌 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to="/app/home" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>L</span>
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              LumaTrip
            </span>
          </Link>
          
          {/* 导航链接 */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    background: isActive 
                      ? 'rgba(102, 126, 234, 0.1)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: isActive ? '#667eea' : '#374151',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 搜索栏 */}
        <div style={{
          flex: 1,
          maxWidth: '320px',
          margin: '0 16px',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="搜索..."
            style={{
              width: '100%',
              padding: '8px 8px 8px 32px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <IconSearch style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#9ca3af'
          }} />
        </div>

        {/* 右侧功能 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 通知 */}
          <button style={{
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <IconBell style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              borderRadius: '50%'
            }}></div>
          </button>

          {/* 消息 */}
          <Link to="/app/messages" style={{
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconMessage style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          </Link>

          {/* 用户菜单 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                color: 'white',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              display: 'none'
            }}>
              {user?.email?.split('@')[0] || '用户'}
            </span>
            <IconChevronDown style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader; 