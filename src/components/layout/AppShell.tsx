import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div>
      {/* Header, Navigation, etc. will go here */}
      <main>{children}</main>
      {/* BottomNav, etc. might go here */}
    </div>
  );
};

export default AppShell;