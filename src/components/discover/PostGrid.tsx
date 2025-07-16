import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';

interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  location: string;
  tags: string[];
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostGridProps {
  posts: Post[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(2); // 移动端: 2列
      } else if (width < 1024) {
        setColumns(3); // 平板: 3列
      } else if (width < 1280) {
        setColumns(4); // 桌面: 4列
      } else {
        setColumns(5); // 大屏: 5列
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // 创建列数组来实现瀑布流布局
  const createColumns = () => {
    const cols: Post[][] = Array.from({ length: columns }, () => []);
    
    posts.forEach((post, index) => {
      const columnIndex = index % columns;
      cols[columnIndex].push(post);
    });
    
    return cols;
  };

  const columnArrays = createColumns();

  return (
    <div className="masonry-grid">
      {columnArrays.map((column, columnIndex) => (
        <div key={columnIndex} className="space-y-4">
          {column.map((post, postIndex) => (
            <div key={post.id} className="stagger-animation" style={{ animationDelay: `${postIndex * 0.05}s` }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PostGrid;