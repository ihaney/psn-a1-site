import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import App from './App';
import './index.css';

// This is the server-side entry point for SSG
export function render(url: string, context: any = {}) {
  // Create a fresh query client for each render
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // For SSG, we want to use the cache and not refetch
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  // Create a Helmet context to collect head tags
  const helmetContext = {} as { helmet: HelmetServerState };

  // Render the app to string
  const appHtml = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

  // Get the query cache state for hydration
  const dehydratedState = JSON.stringify(
    queryClient.getQueryCache().getAll().map(query => ({
      queryKey: query.queryKey,
      state: query.state
    }))
  );

  // Get the Helmet data for head tags
  const { helmet } = helmetContext;

  // Return the rendered HTML and metadata
  return {
    html: appHtml,
    head: {
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      link: helmet.link.toString(),
      style: helmet.style.toString(),
      script: helmet.script.toString(),
    },
    context: {
      // Pass the dehydrated state to be used for hydration on the client
      DEHYDRATED_STATE: dehydratedState,
    },
  };
}