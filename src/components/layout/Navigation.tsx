import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li><a href="/app/home">Home</a></li>
        <li><a href="/app/discover">Discover</a></li>
        <li><a href="/app/messages">Messages</a></li>
        <li><a href="/app/profile">Profile</a></li>
      </ul>
    </nav>
  );
};

export default Navigation;