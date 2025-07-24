import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Users, Calendar, Sparkles, Bot, Brain, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIChatBox from '../components/ai/AIChatBox';
import '../styles/Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI 旅行规划',
      description: '智能定制专属行程',
      to: '/app/ai-assistant',
      color: '#8b5cf6'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: '探索地图',
      description: '发现周边精彩地点',
      to: '/app/map-example',
      color: '#3b82f6'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '社交互动',
      description: '与旅行者交流',
      to: '/app/messages',
      color: '#ec4899'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: '行程管理',
      description: '管理您的旅程',
      to: '/app/discover',
      color: '#10b981'
    }
  ];

  const aiFeatures = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: '智能规划',
      description: '基于您的偏好定制完美行程'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: '即时回答',
      description: '24/7 随时解答旅行疑问'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: '个性推荐',
      description: '发现符合您兴趣的独特体验'
    }
  ];

  return (
    <div className="home-page">
      {/* 背景效果 */}
      <div className="home-background"></div>

      <div className="home-content">
        {/* 英雄区域 */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-layout">
              
              {/* 左侧内容 */}
              <div className="content-area">
                <div className="title-group">
                  <div className="bot-icon-wrapper">
                    <Bot className="bot-icon" />
                  </div>
                  <div className="title-text">
                    <h1 className="main-title">AI 旅行助手</h1>
                    <p className="welcome-text">
                      欢迎回来，{user?.email?.split('@')[0] || '旅行者'}！
                    </p>
                  </div>
                </div>
                
                <p className="hero-description">
                  🤖 让AI为您规划完美旅程，探索无限可能的世界
                </p>

                <div className="features-list">
                  {aiFeatures.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <div className="feature-icon">
                        {feature.icon}
                      </div>
                      <div className="feature-text">
                        <h4 className="feature-title">{feature.title}</h4>
                        <p className="feature-desc">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="action-buttons">
                  <button className="btn-primary">
                    <Bot size={24} />
                    <span>🚀 开始AI对话</span>
                  </button>
                  <Link to="/app/map-example" className="btn-secondary">
                    <MapPin size={24} />
                    <span>🗺️ 探索地图</span>
                  </Link>
                </div>
              </div>

              {/* 右侧AI对话框 */}
              <div className="chat-area">
                <div className="chat-wrapper">
                  <AIChatBox 
                    compact 
                    onMessageSent={(message) => {
                      console.log('用户发送消息:', message);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 快速操作区域 */}
        <section className="actions-section">
          <div className="actions-container">
            <div className="actions-header">
              <h2>🤖 AI 驱动的智能旅行</h2>
              <p>体验最先进的人工智能旅行规划，让每次旅程都完美无瑕</p>
            </div>
            
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.to} className="action-card">
                  {index === 0 && (
                    <div className="ai-badge">
                      <Sparkles size={14} />
                      AI 核心
                    </div>
                  )}
                  
                  <div className="action-icon" data-color={action.color}>
                    {action.icon}
                  </div>
                  
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-desc">{action.description}</p>
                  
                  {index === 0 && (
                    <div className="ai-special">
                      <p>✨ 基于大数据和机器学习，为您量身定制旅行体验</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;