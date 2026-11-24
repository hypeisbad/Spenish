import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/outfit';
import '@fontsource-variable/fraunces';
import './styles/global.css';
import App from './App';
import { IS_ARTIFACT, initHost } from './lib/host';

void initHost();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support — register the service worker in production builds.
if (import.meta.env.PROD && !IS_ARTIFACT && 'serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline mode unavailable — the app still works online */
    });
  });
}
