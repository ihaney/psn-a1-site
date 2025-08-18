// src/entry-client.tsx
import 'leaflet/dist/leaflet.css';  // Load Leaflet first
import './index.css';               // Then your overrides

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { queryClient } from './lib/queryClient';

// Mount only in the browser
export function mount() {
  const el = typeof document !== 'undefined' ? document.getElementById('root') : null;
  if (!el) return;
  createRoot(el).render(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" />
            {import.meta.env.DEV && <ReactQueryDevtools />}
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  mount();
}

// Export a no-DOM factory so SSR can import this file safely
export function createApp() {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}
