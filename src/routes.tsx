import React from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const SupplierPage = React.lazy(() => import('./pages/SupplierPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage'));
const SuppliersListPage = React.lazy(() => import('./pages/SuppliersListPage'));
const SourcesListPage = React.lazy(() => import('./pages/SourcesListPage'));
const CountriesListPage = React.lazy(() => import('./pages/CountriesListPage'));
const SavedItemsPage = React.lazy(() => import('./pages/SavedItemsPage'));
const MessageHistoryPage = React.lazy(() => import('./pages/MessageHistoryPage'));
const RFQTemplatePage = React.lazy(() => import('./pages/RFQTemplatePage'));
const TariffCalculatorPage = React.lazy(() => import('./pages/TariffCalculatorPage'));
const CreateProfilePage = React.lazy(() => import('./pages/CreateProfilePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SupplierProductsListPage = React.lazy(() => import('./pages/SupplierProductsListPage'));
const PoliciesPage = React.lazy(() => import('./pages/PoliciesPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));

// Define routes
const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/products',
    element: <ProductsPage />
  },
  {
    path: '/product/:id',
    element: <ProductPage />
  },
  {
    path: '/supplier/:slug/:supplierId',
    element: <SupplierPage />
  },
  {
    path: '/supplier/:slug/:supplierId/products',
    element: <SupplierProductsListPage />
  },
  {
    path: '/categories',
    element: <CategoriesPage />
  },
  {
    path: '/about',
    element: <AboutPage />
  },
  {
    path: '/policies',
    element: <PoliciesPage />
  },
  {
    path: '/contact',
    element: <ContactPage />
  },
  {
    path: '/search',
    element: <SearchResultsPage />
  },
  {
    path: '/suppliers',
    element: <SuppliersListPage />
  },
  {
    path: '/sources',
    element: <SourcesListPage />
  },
  {
    path: '/countries',
    element: <CountriesListPage />
  },
  {
    path: '/saved-items',
    element: <SavedItemsPage />
  },
  {
    path: '/message-history',
    element: <MessageHistoryPage />
  },
  {
    path: '/tools/rfq-template',
    element: <RFQTemplatePage />
  },
  {
    path: '/tools/tariff-calculator',
    element: <TariffCalculatorPage />
  },
  {
    path: '/create-profile',
    element: <CreateProfilePage />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  }
];

export default routes;