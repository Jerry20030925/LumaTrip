import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import i18n from './i18n';
import App from './App.tsx';
import './index.css';

const theme = createTheme({
  primaryColor: 'blue',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </MantineProvider>
  </StrictMode>
);
