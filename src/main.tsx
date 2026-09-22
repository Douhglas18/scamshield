import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA support and offline caching in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[ScamShield PWA] New version ready to update.');
      },
      onOfflineReady() {
        console.log('[ScamShield PWA] App ready to work offline.');
      },
      onRegisterError(error: unknown) {
        console.warn('[ScamShield PWA] Service worker registration deferred:', error);
      },
    });
  } catch (err) {
    console.warn('[ScamShield PWA] SW init deferred:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

