import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSources } from '../services/api';
import { logSearchQuery } from '../services/analytics';
import { createSupplierUrl } from '../utils/urlUtils';
import SearchHeader from '../components/SearchHeader';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import SupplierCard from '../components/SupplierCard';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  supplier?: string;
  country?: string;
  category?: string;
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

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get('q') || '';
  const initialMode = (searchParams.get('mode') as 'products' | 'suppliers') || 'products';
  const initialCategory = searchParams.get('category');
  const initialCountry = searchParams.get('country');
  const initialSource = searchParams.get('source');

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<'products' | 'suppliers'>(initialMode);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>(() => {
    const initialFilters: { [key: string]: string[] } = {};
    const categoryParam = queryParams.get('category');
    const countryParam = queryParams.get('country');
    const sourceParam = queryParams.get('source');

    if (categoryParam) {
      initialFilters['Product_Category_Name'] = [categoryParam];
    }
    if (countryParam) {
      if (initialMode === 'products') {
        initialFilters['Product_Country_Name'] = [countryParam];
      } else {
        initialFilters['Supplier_Country_Name'] = [countryParam];
      }
    }
    if (sourceParam) {
      if (initialMode === 'products') {
        initialFilters['Product_Source_Name'] = [sourceParam];
      } else {
        initialFilters['Supplier_Source_ID'] = [sourceParam];
      }
    }
    return initialFilters;
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [facetDistribution, setFacetDistribution] = useState<any>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Fetch all sources for mapping
  const { data: allSources } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchAllSources,
    staleTime: Infinity,
  });

  const allSourcesMap = useMemo(() => {
    if (!allSources) return {};
    return allSources.reduce((acc: { [key: string]: string }, source: any) => {
      acc[source.Source_ID] = source.Source_Title;
      return acc;
    }, {});
  }, [allSources]);

  // Update URL params when search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchMode !== 'products') params.set('mode', searchMode);
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, searchMode, navigate]);

  // Perform search when query or filters change
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
        const meilisearchFilters: string[] = [];
        const meilisearchSort: string[] = [];
        let facets: string[] = [];

        // Build Meilisearch filters from activeFilters state
        for (const filterKey in activeFilters) {
          if (activeFilters[filterKey].length > 0) {
            const filterValues = activeFilters[filterKey].map(value => `${filterKey} = "${value}"`).join(' OR ');
            meilisearchFilters.push(`(${filterValues})`);
          }
        }

        // Build Meilisearch sort
        if (sortBy !== 'relevance') {
          meilisearchSort.push(sortBy);
        }

        if (searchMode === 'products') {
          facets = ['Product_Category_Name', 'Product_Country_Name', 'Product_Source_Name'];
          
          const productsResults = await fetch('/api/search/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: debouncedQuery.trim(),
              filter: meilisearchFilters,
              sort: meilisearchSort,
              facets,
              limit: 50,
            }),
          }).then(res => res.json());

          const searchResults = productsResults.hits.map((hit: any) => ({
            id: hit.id,
            title: hit.Product_Title,
            description: hit.Product_Description || '',
            image: hit.Product_Image_URL || '/placeholder-product.jpg',
            price: hit.Product_Price ? `$${hit.Product_Price}` : undefined,
            supplier: hit.Supplier_Title,
            country: hit.Product_Country_Name,
            category: hit.Product_Category_Name,
            url: `/product/${hit.id}`
          }));
          setFacetDistribution(productsResults.facetDistribution);

        } else { // searchMode === 'suppliers'
          facets = ['Supplier_Country_Name', 'Supplier_Source_ID'];
          
          const suppliersResults = await fetch('/api/search/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: debouncedQuery.trim(),
              filter: meilisearchFilters,
              sort: meilisearchSort,
              facets,
              limit: 50,
            }),
          }).then(res => res.json());

          const searchResults = suppliersResults.hits.map((hit: any) => ({
            id: hit.Supplier_ID,
            title: hit.Supplier_Title,
            description: hit.Supplier_Description || '',
            image: hit.Supplier_Logo_URL || '/placeholder-supplier.jpg',
            country: hit.Supplier_Country_Name,
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
  }, [debouncedQuery, activeFilters, sortBy, searchMode]);

  const handleFilterChange = useCallback((filterKey: string, optionId: string) => {
    setActiveFilters(prev => {
      const currentFilters = prev[filterKey] || [];
      const isSelected = currentFilters.includes(optionId);
      
      if (isSelected) {
        return {
          ...prev,
          [filterKey]: currentFilters.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [filterKey]: [...currentFilters, optionId]
        };
      }
    });
  }, []);

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (searchMode === 'products') {
      // Categories
      groups.push({
        title: 'Category Type',
        key: 'Product_Category_Name',
        options: Object.entries(facetDistribution['Product_Category_Name'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['Product_Category_Name'] || [],
      });

      // Supplier Country
      groups.push({
        title: 'Supplier Country',
        key: 'Product_Country_Name',
        options: Object.entries(facetDistribution['Product_Country_Name'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['Product_Country_Name'] || [],
      });

      // Sources
      groups.push({
        title: 'Sources',
        key: 'Product_Source_Name',
        options: Object.entries(facetDistribution['Product_Source_Name'] || {}).map(([name, count]) => ({
          id: name,
          name: name,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['Product_Source_Name'] || [],
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
      groups.push({
        title: 'Sources',
        key: 'Supplier_Source_ID',
        options: Object.entries(facetDistribution['Supplier_Source_ID'] || {}).map(([id, count]) => ({
          id: id,
          name: allSourcesMap?.[id] || id,
          count: count as number,
        })).sort((a, b) => b.count - a.count),
        selected: activeFilters['Supplier_Source_ID'] || [],
      });
    }

    return groups;
  }, [facetDistribution, activeFilters, searchMode, allSourcesMap]);

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

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const totalActiveFilters = useMemo(() => {
    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
  }, [activeFilters]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <>
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchMode={searchMode}
        onModeChange={setSearchMode}
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle={`Search Results for "${searchQuery}"`} />

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Filters */}
            <div className="md:w-1/4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-100">Filters</h2>
                  {totalActiveFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium"
                    >
                      Clear All ({totalActiveFilters})
                    </button>
                  )}
                </div>

                {loading && !facetDistribution ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : filterGroups.length === 0 ? (
                  <p className="text-gray-400 text-sm">No filters available for this search.</p>
                ) : (
                  <div className="space-y-6">
                    {filterGroups.map((group) => (
                      <div key={group.key} className="border-b border-gray-700 pb-4 last:border-b-0">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === group.key ? null : group.key)}
                          className="flex items-center justify-between w-full text-left py-2 text-gray-200 hover:text-white"
                        >
                          <span className="flex items-center gap-2">
                            {group.title}
                            {group.selected.length > 0 && (
                              <span className="bg-[#F4A024] text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                {group.selected.length}
                              </span>
                            )}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === group.key ? 'rotate-180' : ''}`} />
                        </button>
                        {(activeDropdown === group.key || group.selected.length > 0 || group.options.length > 0) && (
                          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            {group.options.length > 0 ? (
                              group.options.map(option => (
                                <label key={option.id} className="flex items-center cursor-pointer hover:bg-gray-700/30 p-2 rounded">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={group.selected.includes(option.id)}
                                      onChange={() => handleFilterChange(group.key, option.id)}
                                      className="rounded border-gray-600 text-[#F4A024] focus:ring-[#F4A024] focus:ring-offset-0 w-4 h-4 bg-gray-700/50"
                                    />
                                    <span className="ml-3 truncate">{option.name}</span>
                                  </div>
                                  <span className="ml-auto text-xs text-gray-400">({option.count})</span>
                                </label>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm py-2">No options available for this search.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Results and Sorting */}
            <div className="md:w-3/4">
              {/* Search Mode Tabs */}
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setSearchMode('products')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    searchMode === 'products'
                      ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setSearchMode('suppliers')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    searchMode === 'suppliers'
                      ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
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
                  <label htmlFor="sort" className="text-gray-300 text-sm">Sort by:</label>
                  <div className="relative">
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="appearance-none bg-gray-800/50 text-gray-300 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A024] cursor-pointer text-sm border border-gray-600"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 font-bold">Error: {error}</p>
                  <p className="text-gray-300">Please try again later.</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg">
                  <p className="text-gray-300 font-bold">No {searchMode} found for "{searchQuery}"</p>
                  {totalActiveFilters > 0 && (
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search query or clearing some filters.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map(result => (
                    searchMode === 'products' ? (
                      <ProductCard
                        key={result.id}
                        id={result.id}
                        title={result.title}
                        description={result.description}
                        image={result.image}
                        price={result.price}
                        supplier={result.supplier}
                        country={result.country}
                        category={result.category}
                        url={result.url}
                      />
                    ) : (
                      <SupplierCard
                        key={result.id}
                        id={result.id}
                        title={result.title}
                        description={result.description}
                        image={result.image}
                        country={result.country}
                        url={result.url}
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
};

export default SearchResultsPage;