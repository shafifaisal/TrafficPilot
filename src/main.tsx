import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hookWindowFetch } from './lib/apiFallback.ts';
import { Analytics } from '@vercel/analytics/react';

// Initialize the API sandbox interceptor before the React tree loads
hookWindowFetch();

// Dynamically inject Google Analytics 4 if measurement ID exists in client environment variables
const GA_ID = ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string) || '';
if (GA_ID) {
  const gTagScript = document.createElement('script');
  gTagScript.async = true;
  gTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(gTagScript);

  const initScript = document.createElement('script');
  initScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID.replace(/[^a-zA-Z0-9-]/g, '')}');
  `;
  document.head.appendChild(initScript);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);

