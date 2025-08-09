import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type EventOptions = {
  props?: Record<string, string | number | boolean>;
  nonInteraction?: boolean;
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, string | number | boolean> }) => void;
    dataLayer?: any[];
  }
}

export const analytics = {
  trackPageview: (title?: string) => {
    // Google Analytics is now handled automatically by the gtag script in index.html
    // No need to manually track page views for Google Analytics

    // Track in Plausible with custom props
    if (window.plausible) {
      window.plausible('pageview', {
        props: {
          title: title || document.title,
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer
        }
      });
    }
  },

  trackEvent: (eventName: string, options?: EventOptions) => {
    // Track in Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...options?.props,
        non_interaction: options?.nonInteraction || false
      });
    }

    // Track in Plausible with enhanced props
    if (window.plausible) {
      window.plausible(eventName, {
        props: {
          ...options?.props,
          timestamp: new Date().toISOString(),
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          user_agent: navigator.userAgent
        }
      });
    }
  },

  // Track time spent on page
  startTimer: (pageName: string) => {
    const startTime = Date.now();
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // Convert to seconds
      
      // Track in both analytics platforms
      analytics.trackEvent('time_spent', {
        props: {
          page: pageName,
          duration: timeSpent,
          duration_readable: `${timeSpent} seconds`
        }
      });
    };
  }
};

// Hook to track page views and time spent
export function useAnalytics(pageName: string) {
  const location = useLocation();

  useEffect(() => {
    // Track page view with enhanced metadata
    analytics.trackPageview();

    // Start timer for this page
    const stopTimer = analytics.startTimer(pageName);

    // Clean up and send time spent when leaving page
    return () => stopTimer();
  }, [location, pageName]);
}