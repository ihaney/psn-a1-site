import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Package, Building2 } from 'lucide-react';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import SupplierCard from '../components/SupplierCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { productsIndex, suppliersIndex } from '../lib/meilisearch';
import { supabase } from '../lib/supabase';
import { logSearchQuery } from '../lib/searchLogger';
import { createSupplierUrl } from '../utils/urlHelpers';
import Breadcrumbs from '../components/Breadcrumbs';
import { analytics } from '../lib/analytics';

interface SearchResult {
  id: string;
  name: string;
  type: 'product' | 'supplier';
  image?: string;
  country?: string;
  category?: string;
  supplier?: string;
  marketplace?: string;
  price?: string;
  moq?: string;
  product_count?: number;
  description?: string;
  location?: string;
  sourceId?: string;
  sourceTitle?: string;
  productKeywords?: string;
  url: string;
}

interface FilterOption {
  id: string;
  name: string;
  count: number;
}

interface FilterGroup {
  title: string;
  key: string;
  options: FilterOption[];
  selected: string[];
}

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const initialQuery = queryParams.get('q') || '';
  const initialMode = (queryParams.get('mode') as 'products' | 'suppliers') || 'products';
  const initialCategory = queryParams.get('category') || '';
  const initialCountry = queryParams.get('country') || '';
  const initialSource = queryParams.get('source') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<'products' | 'suppliers'>(initialMode);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [facetDistribution, setFacetDistribution] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Fetch all sources for mapping Supplier_Source_ID to Source_Title
  const { data: allSourcesMap } = useQuery({
    queryKey: ['allSourcesMap'],
    queryFn: async () => {
      const { data, error: sourcesError } = await supabase
        .from('Sources')
        .select('Source_ID, Source_Title');
      if (sourcesError) {
        console.error('Error fetching all sources:', sourcesError);
        return {};
      }
      return (data || []).reduce((acc, source) => {
        acc[source.Source_ID] = source.Source_Title;
        return acc;
      }, {} as Record<string, string>);
    },
    staleTime: Infinity,
  });

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: { [key: string]: string[] } = {};
    
    if (initialCategory) {
      initialFilters['Product_Category_ID'] = [initialCategory];
    }
    if (initialCountry) {
      if (searchMode === 'products') {
        initialFilters['Product_Country_Name'] = [initialCountry];
      } else {
        initialFilters['Supplier_Country_Name'] = [initialCountry];
      }
    }
    if (initialSource) {
      if (searchMode === 'products') {
        initialFilters['Product_Source_Name'] = [initialSource];
      } else {
        initialFilters['Supplier_Source_ID'] = [initialSource];
      }
    }
    
    setActiveFilters(initialFilters);
  }, [initialCategory, initialCountry, initialSource, searchMode]);

  // Update URL params when search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchMode) params.set('mode', searchMode);
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, searchMode, navigate]);

  // Perform search when debounced query, mode, filters, or sort order changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setFacetDistribution(null);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let searchResults: SearchResult[] = [];
        let facets: string[] = [];
        let meilisearchFilters: string[] = [];
        let meilisearchSort: string[] = [];

        // Build Meilisearch filters from activeFilters state
        for (const filterKey in activeFilters) {
          if (activeFilters[filterKey].length > 0) {
            const filterValues = activeFilters[filterKey].map(value => `"${value}"`).join(' OR ');
            meilisearchFilters.push(`${filterKey} IN [${filterValues}]`);
          }
        }

        // Build Meilisearch sort
        if (sortBy !== 'relevance') {
          if (sortBy === 'price:asc') {
            meilisearchSort.push('price:asc');
          } else if (sortBy === 'price:desc') {
            meilisearchSort.push('price:desc');
          } else if (sortBy === 'product_count:desc') {
            meilisearchSort.push('product_count:desc');
          } else if (sortBy === 'product_count:asc') {
            meilisearchSort.push('product_count:asc');
          }
        }

        if (searchMode === 'products') {
          facets = ['category', 'country', 'source'];
          const productsResults = await productsIndex.search(debouncedQuery, {
            limit: 100,
            attributesToRetrieve: [
              'id', 'title', 'price', 'image', 'url', 'moq', 'country', 'category', 'supplier', 'source'
            ],
            facets,
            filter: meilisearchFilters.length > 0 ? meilisearchFilters : undefined,
            sort: meilisearchSort.length > 0 ? meilisearchSort : undefined,
          });

          searchResults = productsResults.hits.map(hit => ({
            id: hit.id as string,
            name: hit.title as string,
            type: 'product' as const,
            image: hit.image as string || '',
            country: hit.country as string || 'Unknown',
            category: hit.category as string || 'Unknown',
            supplier: hit.supplier as string || 'Unknown',
            marketplace: hit.source as string || 'Unknown',
            price: hit.price as string,
            moq: hit.moq as string || 'N/A',
            url: `/product/${hit.id}`
          }));
          setFacetDistribution(productsResults.facetDistribution);
          setTotalResults(productsResults.estimatedTotalHits || productsResults.hits.length);

        } else { // searchMode === 'suppliers'
          facets = ['Supplier_Country_Name', 'Supplier_Source_ID'];
          const suppliersResults = await suppliersIndex.search(debouncedQuery, {
            limit: 100,
            attributesToRetrieve: [
              'Supplier_ID', 'Supplier_Title', 'Supplier_Description', 'Supplier_Country_Name',
              'Supplier_City_Name', 'Supplier_Location', 'Supplier_Source_ID', 'product_count', 'product_keywords'
            ],
            facets,
            filter: meilisearchFilters.length > 0 ? meilisearchFilters : undefined,
            sort: meilisearchSort.length > 0 ? meilisearchSort : undefined,
          });

          searchResults = suppliersResults.hits.map(hit => ({
            id: hit.Supplier_ID as string,
            name: hit.Supplier_Title as string,
            type: 'supplier' as const,
            country: hit.Supplier_Country_Name as string || 'Unknown',
            location: hit.Supplier_Location as string || hit.Supplier_City_Name as string || 'Unknown',
            description: hit.Supplier_Description as string || '',
            product_count: hit.product_count as number || 0,
            sourceId: hit.Supplier_Source_ID as string || '',
            sourceTitle: allSourcesMap?.[hit.Supplier_Source_ID as string] || 'Unknown Source',
            productKeywords: hit.product_keywords as string || '',
            url: createSupplierUrl(hit.Supplier_Title as string, hit.Supplier_ID as string)
          }));
          setFacetDistribution(suppliersResults.facetDistribution);
          setTotalResults(suppliersResults.estimatedTotalHits || suppliersResults.hits.length);
        }

        setResults(searchResults);
        logSearchQuery(debouncedQuery.trim(), searchMode);

      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        setResults([]);
        setFacetDistribution(null);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, searchMode, activeFilters, sortBy, allSourcesMap]);
}

2.  **Create Filter Sidebar Component**:
    *   **Filter Groups**: Create a `useMemo` hook to generate filter groups based on `facetDistribution`, `searchMode`, and `allSourcesMap`.
    *   **Filter Order**:
        *   For **Product Search Mode**:
            1.  **Category Type**: Use `facetDistribution['category']` to create options.
            2.  **Supplier Country**: Use `facetDistribution['country']` to create options.
            3.  **Sources**: Use `facetDistribution['source']` to create options.
        *   For **Supplier Search Mode**:
            1.  **Supplier Country**: Use `facetDistribution['Supplier_Country_Name']` to create options.
            2.  **Sources**: Use `facetDistribution['Supplier_Source_ID']` and map IDs to titles using `allSourcesMap`.
    *   **Interaction**: Implement `handleFilterChange` function to toggle filter selections and update `activeFilters` state.
    *   **UI**: Each filter group will have a collapsible section with checkboxes for individual options and counts displayed next to each option name.

3.  **Create Sorting Controls Component**:
    *   **Sorting Options**: Create a `useMemo` hook to generate sorting options based on `searchMode`.
    *   **For Product Search Mode**:
        *   "Relevance" (default)
        *   "Price: Low to High"
        *   "Price: High to Low"
    *   **For Supplier Search Mode**:
        *   "Relevance" (default)
        *   "Product Count: High to Low"
        *   "Product Count: Low to High"
    *   **Interaction**: Implement `handleSortChange` function to update `sortBy` state when a new sorting option is selected.

4.  **Update Layout and Styling**:
    *   **Two-Column Layout**: Use CSS Grid or Flexbox to create a responsive two-column layout.
    *   **Filter Sidebar Styling**: Style the left column with a background, padding, and appropriate spacing for filter groups.
    *   **Results Column Styling**: Ensure the right column has proper spacing and alignment for the sorting controls and search results grid.
    *   **Responsive Design**: Ensure the layout works well on mobile devices, potentially stacking the columns vertically on smaller screens.

5.  **Handle URL Parameters and Navigation**:
    *   **URL Sync**: Update the URL parameters when filters or sorting options change, allowing users to bookmark or share filtered search results.
    *   **Initial State**: Parse URL parameters on component mount to set initial filter and sorting states.

<boltArtifact id="implement-search-results-redesign" title="Implement search results page redesign with filters and sorting">