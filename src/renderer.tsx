import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import {I18nProvider} from "./lib/i18n";

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Obtener el ambiente desde el proceso principal
if (window.electron?.ipcRenderer) {
  window.electron.ipcRenderer.invoke('get-env').then((env: string) => {
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
