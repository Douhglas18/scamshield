import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA support and offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[ScamShield PWA] New version ready to update.');
  },
  onOfflineReady() {
    console.log('[ScamShield PWA] App ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

