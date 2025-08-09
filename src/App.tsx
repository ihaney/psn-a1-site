import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TourGuide from './components/TourGuide';
import { useAnalytics } from './lib/analytics';
import { useScrollToTop } from './hooks/useScrollToTop';
import routes from './routes';

// Navigation history tracker component
function NavigationHistoryTracker({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  useEffect(() => {
    // Get current history stack
    const historyStack = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    // Generate a title for the current path
    let pageTitle = 'Home';
    
    if (location.pathname === '/') {
      pageTitle = 'Home';
    } else if (location.pathname === '/products') {
      pageTitle = 'Products';
    } else if (location.pathname === '/categories') {
      pageTitle = 'Categories';
    } else if (location.pathname === '/about') {
      pageTitle = 'About';
    } else if (location.pathname === '/policies') {
      pageTitle = 'Policies';
    } else if (location.pathname === '/contact') {
      pageTitle = 'Contact';
    } else if (location.pathname === '/search') {
      pageTitle = 'Search Results';
    } else if (location.pathname === '/suppliers') {
      pageTitle = 'Suppliers';
    } else if (location.pathname === '/sources') {
      pageTitle = 'Sources';
    } else if (location.pathname === '/countries') {
      pageTitle = 'Countries';
    } else if (location.pathname === '/saved-items') {
      pageTitle = 'Saved Items';
    } else if (location.pathname === '/message-history') {
      pageTitle = 'Message History';
    } else if (location.pathname === '/tools/rfq-template') {
      pageTitle = 'RFQ Template';
    } else if (location.pathname === '/tools/tariff-calculator') {
      pageTitle = 'Tariff Calculator';
    } else if (location.pathname === '/create-profile') {
      pageTitle = 'Create Profile';
    } else if (location.pathname === '/profile') {
      pageTitle = 'Profile';
    } else if (location.pathname.startsWith('/product/')) {
      pageTitle = 'Product Details';
    } else if (location.pathname.startsWith('/supplier/')) {
      pageTitle = 'Supplier Details';
    }
    
    // Check if we're navigating to the same page
    const currentEntry = historyStack.length > 0 ? historyStack[historyStack.length - 1] : null;
    if (currentEntry && currentEntry.path === location.pathname) {
      return; // Don't add duplicate entries
    }
    
    // Add current path to history stack
    const newHistoryStack = [...historyStack, { path: location.pathname, title: pageTitle }];
    
    // Keep only the last 10 entries to prevent excessive storage
    if (newHistoryStack.length > 10) {
      newHistoryStack.shift();
    }
    
    // Save updated history stack
    sessionStorage.setItem('navigationHistory', JSON.stringify(newHistoryStack));
  }, [location.pathname]);
  
  return <>{children}</>;
}

// Analytics wrapper component
function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  useAnalytics('app');
  useScrollToTop(); // Add scroll to top behavior
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <AnalyticsWrapper>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
          <div className="fixed inset-0 pointer-events-none gradient-overlay"></div>
          <Navbar />
          
          <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
              <LoadingSpinner />
            </div>
          }>
            <NavigationHistoryTracker>
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </NavigationHistoryTracker>
          </Suspense>
          <Footer />
          <TourGuide />
        </div>
      </AnalyticsWrapper>
    </ErrorBoundary>
  );
}

export default App;