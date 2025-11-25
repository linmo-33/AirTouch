import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { checkInstallPrompt, registerServiceWorker } from './utils/pwa';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 注册 Service Worker 和 PWA 功能
if (import.meta.env.PROD) {
  registerServiceWorker();
  checkInstallPrompt();
}
