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
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>(() => {
    const initialFilters: { [key: string]: string[] } = {};
    
    if (initialCategory) {
      initialFilters['category'] = [initialCategory];
    }
    if (initialCountry) {
      if (initialMode === 'products') {
        initialFilters['country'] = [initialCountry];
      } else {
        initialFilters['Supplier_Country_Name'] = [initialCountry];
      }
    }
    if (initialSource) {
      if (initialMode === 'products') {
        initialFilters['source'] = [initialSource];
      } else {
        initialFilters['Supplier_Source_ID'] = [initialSource];
      }
    }
    
    return initialFilters;
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [facetDistribution, setFacetDistribution] = useState<any>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
        setFacetDistribution({});
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
        }

        setResults(searchResults);
        logSearchQuery(debouncedQuery.trim(), searchMode);

      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        setResults([]);
        setFacetDistribution({});
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, searchMode, activeFilters, sortBy, allSourcesMap]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Trigger search via debouncedQuery useEffect
  }, []);

  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    setActiveFilters(prev => {
      const currentSelection = prev[filterKey] || [];
      if (currentSelection.includes(value)) {
        return { ...prev, [filterKey]: currentSelection.filter(item => item !== value) };
      } else {
        return { ...prev, [filterKey]: [...currentSelection, value] };
      }
    });
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (searchMode === 'products') {
      // Categories
      groups.push({
        title: 'Category Type',
        key: 'category',
        options: Object.entries(facetDistribution['category'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['category'] || [],
      });

      // Supplier Country
      groups.push({
        title: 'Supplier Country',
        key: 'country',
        options: Object.entries(facetDistribution['country'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['country'] || [],
      });

      // Sources
      groups.push({
        title: 'Sources',
        key: 'source',
        options: Object.entries(facetDistribution['source'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['source'] || [],
      });
    } else { // searchMode === 'suppliers'
      // Supplier Country
      groups.push({
        title: 'Supplier Country',
        key: 'Supplier_Country_Name',
        options: Object.entries(facetDistribution['Supplier_Country_Name'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['Supplier_Country_Name'] || [],
      });

      // Sources
      if (facetDistribution['Supplier_Source_ID'] && allSourcesMap) {
        groups.push({
          title: 'Sources',
          key: 'Supplier_Source_ID',
          options: Object.entries(facetDistribution['Supplier_Source_ID'] || {}).map(([id, count]) => ({
            id: id,
            name: allSourcesMap[id] || id,
            count: count as number,
          })).sort((a, b) => b.count - a.count),
          selected: activeFilters['Supplier_Source_ID'] || [],
        });
      } else {
        groups.push({
          title: 'Sources',
          key: 'Supplier_Source_ID',
          options: [],
          selected: activeFilters['Supplier_Source_ID'] || [],
        });
      }
    }

    return groups;
  }, [facetDistribution, searchMode, activeFilters]);

  const sortOptions = useMemo(() => {
    if (searchMode === 'products') {
      return [
        { value: 'relevance', label: 'Relevance' },
        { value: 'price:asc', label: 'Price: Low to High' },
        { value: 'price:desc', label: 'Price: High to Low' },
      ];
    } else { // searchMode === 'suppliers'
      return [
        { value: 'relevance', label: 'Relevance' },
        { value: 'product_count:desc', label: 'Product Count: High to Low' },
        { value: 'product_count:asc', label: 'Product Count: Low to High' },
      ];
    }
  }, [searchMode]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const totalActiveFilters = useMemo(() => {
    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
  }, [activeFilters]);

  const totalActiveFilters = useMemo(() => {
    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
  }, [activeFilters]);

  return (
    <>
      <SEO
        title={`Search Results for "${initialQuery}"`}
        description={`Explore ${searchMode} related to "${initialQuery}" on Paisán.`}
        keywords={`${initialQuery}, ${searchMode}, Latin American products, suppliers, marketplace`}
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle={`Search Results for "${searchQuery}"`} />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Filters */}
            <div className="lg:w-1/4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">Filters</h2>
                  {totalActiveFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-[#F4A024] hover:text-[#F4A024]/80 transition-colors"
                    >
                      Clear all ({totalActiveFilters})
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {filterGroups.map(group => (
                      <div key={group.key} className="border-b border-gray-700 pb-4 last:border-b-0">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === group.key ? null : group.key)}
                          className="w-full flex items-center justify-between text-gray-300 hover:text-gray-100 py-2 text-base font-medium transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {group.title}
                            {group.selected.length > 0 && (
                              <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                                {group.selected.length}
                              </span>
                            )}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === group.key ? 'rotate-180' : ''}`} />
                        </button>
                        {activeDropdown === group.key && (
                          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            {group.options.length > 0 ? (
                              group.options.map(option => (
                                <label key={option.id} className="flex items-center justify-between text-gray-300 text-sm cursor-pointer hover:text-gray-100 transition-colors py-1">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={group.selected.includes(option.id)}
                                      onChange={() => handleFilterChange(group.key, option.id)}
                                      className="rounded border-gray-600 text-[#F4A024] focus:ring-[#F4A024] focus:ring-offset-0 w-4 h-4 bg-gray-700"
                                    />
                                    <span className="ml-3 truncate">{option.name}</span>
                                  </div>
                                  <span className="text-gray-400 text-xs ml-2 flex-shrink-0">({option.count})</span>
                                </label>
                              ))
                            ) : (
                              <p className="text-gray-500 text-xs">No options available.</p>
                            )}
                          </div>
                        )}
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Results and Sorting */}
            <div className="lg:w-3/4">
              {/* Search Mode Tabs */}
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setSearchMode('products')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    searchMode === 'products'
                      ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Products
                </button>
                <button
                  onClick={() => setSearchMode('suppliers')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    searchMode === 'suppliers'
                      ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Suppliers
                </button>
              </div>

              {/* Results Header and Sorting */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-100">
                    Showing {results.length} {searchMode} for "{searchQuery}"
                  </h1>
                  {totalActiveFilters > 0 && (
                    <p className="text-gray-400 text-sm mt-1">
                      {totalActiveFilters} filter{totalActiveFilters !== 1 ? 's' : ''} applied
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="appearance-none bg-gray-800/50 text-gray-300 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A024] cursor-pointer text-sm border border-gray-600"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {loading && results.length === 0 ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 font-bold">Error: {error}</p>
                  <p className="text-gray-300">Please try again later.</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-300 font-bold">No {searchMode} found for "{initialQuery}"</p>
                  {totalActiveFilters > 0 && (
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search query or clearing some filters.</p>
                  )}
                </div>
              ) : (
                <div className={`grid gap-6 ${searchMode === 'products' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {results.map(result => (
                    result.type === 'product' ? (
                      <ProductCard key={result.id} product={result} />
                    ) : (
                      <SupplierCard
                        key={result.id}
                        supplier={{
                          Supplier_ID: result.id,
                          Supplier_Title: result.name,
                          Supplier_Description: result.description,
                          Supplier_Country_Name: result.country,
                          Supplier_City_Name: result.location,
                          Supplier_Location: result.location,
                          Supplier_Source_ID: result.sourceId,
                          product_keywords: result.productKeywords,
                          Supplier_Website: '',
                          Supplier_Email: '',
                          Supplier_Whatsapp: '',
                        }}
                      />
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}