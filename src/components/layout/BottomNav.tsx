import React from 'react';

const BottomNav: React.FC = () => {
  return (
    <nav style={{ position: 'fixed', bottom: 0, width: '100%', borderTop: '1px solid #ccc', background: '#fff' }}>
      <ul style={{ display: 'flex', justifyContent: 'space-around', listStyle: 'none', padding: 0 }}>
        <li><a href="/">Home</a></li>
        <li><a href="/discover">Discover</a></li>
        <li><a href="/messages">Messages</a></li>
        <li><a href="/profile">Profile</a></li>
      </ul>
    </nav>
  );
};

export default BottomNav;