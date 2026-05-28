import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hookWindowFetch } from './lib/apiFallback.ts';
import { Analytics } from '@vercel/analytics/react';

// Initialize the API sandbox interceptor before the React tree loads
hookWindowFetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);

