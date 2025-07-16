import React from 'react';

interface NotificationItemProps {
  message: string;
  time: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ message, time }) => {
  return (
    <div>
      <p>{message}</p>
      <span>{time}</span>
    </div>
  );
};

export default NotificationItem;