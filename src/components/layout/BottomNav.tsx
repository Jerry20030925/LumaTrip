import React from 'react';

const BottomNav: React.FC = () => {
  return (
    <nav style={{ position: 'fixed', bottom: 0, width: '100%', borderTop: '1px solid #ccc', background: '#fff' }}>
      <ul style={{ display: 'flex', justifyContent: 'space-around', listStyle: 'none', padding: 0 }}>
        <li><a href="/app/home">Home</a></li>
        <li><a href="/app/discover">Discover</a></li>
        <li><a href="/app/messages">Messages</a></li>
        <li><a href="/app/profile">Profile</a></li>
      </ul>
    </nav>
  );
};

export default BottomNav;