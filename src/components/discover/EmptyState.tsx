import React from 'react';
import { Search, Plus, Compass } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'discover' | 'no-posts';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />,
          title: '没有找到相关内容',
          description: '尝试调整搜索关键词或浏览其他内容',
          actionText: '去探索',
          actionIcon: <Compass className="h-4 w-4" />
        };
      case 'discover':
        return {
          icon: <Compass className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />,
          title: '还没有人分享内容',
          description: '成为第一个分享精彩内容的人吧！',
          actionText: '创建帖子',
          actionIcon: <Plus className="h-4 w-4" />
        };
      case 'no-posts':
        return {
          icon: <Plus className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />,
          title: '暂无内容',
          description: '关注更多用户或创建自己的内容来充实您的发现页面',
          actionText: '创建帖子',
          actionIcon: <Plus className="h-4 w-4" />
        };
      default:
        return {
          icon: <Search className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />,
          title: '暂无内容',
          description: '暂时没有可显示的内容',
          actionText: '刷新',
          actionIcon: null
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6">
        {content.icon}
      </div>
      
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {content.title}
      </h3>
      
      <p className="text-sm mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
        {content.description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg btn-ripple"
          style={{ backgroundColor: 'var(--primary-blue)' }}
        >
          {content.actionIcon && <span className="mr-2">{content.actionIcon}</span>}
          {content.actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;