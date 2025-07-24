import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import AppRoutes from './routes';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

const App: React.FC = () => {
  return (
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
