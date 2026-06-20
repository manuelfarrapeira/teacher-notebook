import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { I18nProvider } from './lib/i18n';
import { initTooltipViewport } from './lib/tooltipViewport';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

initTooltipViewport();

if (window.electronAPI?.getEnv) {
  window.electronAPI.getEnv().then((env: string) => {
    localStorage.setItem('APP_ENV', env);
    const root = createRoot(container);
    root.render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );
  });
} else {
  const root = createRoot(container);
  root.render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );
}
