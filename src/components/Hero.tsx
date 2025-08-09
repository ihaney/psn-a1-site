import React, { useState, useCallback, useEffect } from 'react';
import { Search, Package, Building2 } from 'lucide-react';
import { analytics } from '../lib/analytics';
import { useNavigate } from 'react-router-dom';
import { productsIndex, suppliersIndex } from '../lib/meilisearch';
import { supabase } from '../lib/supabase';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import LoadingSpinner from './LoadingSpinner';
import { logError } from '../lib/errorLogging';
import { logSearchQuery } from '../lib/searchLogger';
import { createSupplierUrl } from '../utils/urlHelpers';

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
  url: string;
}

// Helper function to get saved search mode from localStorage
function getSavedSearchMode(): 'products' | 'suppliers' {
  try {
    const saved = localStorage.getItem('paisan_search_mode');
    return saved === 'suppliers' ? 'suppliers' : 'products';
  } catch {
    return 'products';
  }
}

// Helper function to save search mode to localStorage
function saveSearchMode(mode: 'products' | 'suppliers') {
  try {
    localStorage.setItem('paisan_search_mode', mode);
  } catch {
    // Silently fail if localStorage is not available
  }
}

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'products' | 'suppliers'>(getSavedSearchMode);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalSuppliers, setTotalSuppliers] = useState<number | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsError(null);
      try {
        // Fetch products count with error handling
        const productsResponse = await supabase
          .from('Products')
          .select('Product_ID', { count: 'estimated', head: true });
        
        if (productsResponse.error) {
          console.error('Error fetching products count:', productsResponse.error);
          setStatsError('Unable to load product statistics');
          return;
        }
        
        // Fetch suppliers count with error handling
        const suppliersResponse = await supabase
          .from('Supplier')
          .select('Supplier_ID', { count: 'estimated', head: true });
        
        if (suppliersResponse.error) {
          console.error('Error fetching suppliers count:', suppliersResponse.error);
          setStatsError('Unable to load supplier statistics');
          return;
        }

        setTotalProducts(productsResponse.count || 0);
        setTotalSuppliers(suppliersResponse.count || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsError('Unable to load statistics');
      }
    };

    fetchStats();
  }, []);

  // Save search mode to localStorage whenever it changes
  useEffect(() => {
    saveSearchMode(searchMode);
  }, [searchMode]);

  // Perform search when debounced query changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        let searchResults: SearchResult[] = [];

        if (searchMode === 'products') {
          // Search products
          const productsResults = await productsIndex.search(debouncedQuery, {
            limit: 1, // Limit to 1 result for the dropdown
            attributesToRetrieve: [
              'id',
              'title',
              'price',
              'image',
              'url',
              'moq',
              'country',
              'category',
              'supplier',
              'source'
            ]
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
        } else {
          // Search suppliers
          const suppliersResults = await suppliersIndex.search(debouncedQuery, {
            limit: 1, // Limit to 1 result for the dropdown
            attributesToRetrieve: [
              'Supplier_ID',
              'Supplier_Title',
              'Supplier_Description',
              'Supplier_Country_Name',
              'Supplier_City_Name',
              'Supplier_Location',
              'Supplier_Source_ID',
              'product_count',
              'product_keywords'
            ]
          });

          // Extract unique source IDs for batch fetching
          const sourceIds = [...new Set(
            suppliersResults.hits
              .map(hit => hit.Supplier_Source_ID as string)
              .filter(Boolean)
          )];

          // Fetch source titles from Supabase
          let sourceTitles: Record<string, string> = {};
          if (sourceIds.length > 0) {
            try {
              const { data: sourcesData, error: sourcesError } = await supabase
                .from('Sources')
                .select('Source_ID, Source_Title')
                .in('Source_ID', sourceIds);

              if (sourcesError) {
                console.error('Error fetching sources:', sourcesError);
              } else if (sourcesData) {
                sourceTitles = sourcesData.reduce((acc, source) => {
                  acc[source.Source_ID] = source.Source_Title;
                  return acc;
                }, {} as Record<string, string>);
              }
            } catch (err) {
              console.error('Error in source fetch:', err);
            }
          }

          searchResults = suppliersResults.hits.map(hit => ({
            id: hit.Supplier_ID as string,
            name: hit.Supplier_Title as string,
            type: 'supplier' as const,
            country: hit.Supplier_Country_Name as string || 'Unknown',
            location: hit.Supplier_Location as string || hit.Supplier_City_Name as string || 'Unknown',
            description: hit.Supplier_Description as string || '',
            product_count: hit.product_count as number || 0,
            sourceId: hit.Supplier_Source_ID as string || '',
            sourceTitle: sourceTitles[hit.Supplier_Source_ID as string] || 'Unknown Source',
            productKeywords: hit.product_keywords as string || '',
            url: createSupplierUrl(hit.Supplier_Title as string, hit.Supplier_ID as string)
          }));
        }

        setResults(searchResults);

        if (!searchResults.length && debouncedQuery.length > 2) {
          logError(new Error('Hero search returned no results'), {
            type: 'hero_search_no_results',
            query: debouncedQuery,
            mode: searchMode
          }, 'warning');
        }
      } catch (err) {
        console.error('Search error:', err);
        logError(err instanceof Error ? err : new Error('Hero search failed'), {
          type: 'hero_search_error',
          query: debouncedQuery,
          mode: searchMode
        });
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, searchMode]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      analytics.trackEvent('hero_search_submit', {
        props: { 
          query: searchQuery,
          mode: searchMode
        }
      });
      
      // Log the search query
      logSearchQuery(searchQuery.trim(), searchMode);
      
      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        mode: searchMode
      });
      navigate(`/search?${searchParams.toString()}`);
    }
  }, [searchQuery, navigate, searchMode]);

  const handleResultClick = (result: SearchResult) => {
    analytics.trackEvent('hero_search_result_click', {
      props: { 
        result_id: result.id,
        result_name: result.name,
        result_type: result.type,
        query: searchQuery
      }
    });
    
    // Log the search query when clicking a result
    logSearchQuery(searchQuery.trim(), searchMode);
    
    navigate(result.url);
    setSearchQuery('');
    setResults([]);
  };

  const handleSearchModeChange = (mode: 'products' | 'suppliers') => {
    setSearchMode(mode);
    analytics.trackEvent('hero_search_mode_change', {
      props: { mode }
    });
  };

  return (
    <div className="relative overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 pt-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-100 sm:text-5xl md:text-6xl">
                <span className="block">Discover</span>
                <span className="block text-[#F4A024]">Latin American Products</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                We connect Latin American suppliers with global markets.
              </p>
              
              <div className="mt-8 sm:mt-12 flex justify-center px-4">
                <form onSubmit={handleSearch} className="w-full max-w-2xl">
                  {/* Search Mode Toggle */}
                  <div className="flex justify-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => handleSearchModeChange('suppliers')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        searchMode === 'suppliers'
                          ? 'bg-[#F4A024] text-gray-900'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Suppliers
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSearchModeChange('products')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        searchMode === 'products'
                          ? 'bg-[#F4A024] text-gray-900'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Products
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Search className="w-5 h-5 text-[#F4A024]" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={searchMode === 'products' 
                        ? "Search products, categories, suppliers..." 
                        : "Search suppliers by name, location, capabilities..."}
                      className="w-full px-12 py-4 bg-white/10 hover:bg-white/20 focus:bg-white/20 rounded-lg text-gray-100 placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-[#F4A024] transition-all duration-200"
                    />
                    
                    {searchQuery && (
                      <div className="absolute left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                        {loading ? (
                          <div className="text-center py-4">
                            <LoadingSpinner />
                          </div>
                        ) : results.length > 0 ? (
                          <div>
                            {results.slice(0, 1).map((result) => (
                              <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleResultClick(result)}
                                className="w-full text-left px-4 py-4 hover:bg-gray-700/50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  {result.type === 'product' && result.image && (
                                    <img
                                      src={result.image}
                                      alt={result.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  {result.type === 'supplier' && (
                                    <div className="w-16 h-16 bg-[#F4A024]/10 rounded-lg flex items-center justify-center">
                                      <Building2 className="w-8 h-8 text-[#F4A024]" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white truncate">{result.name}</h3>
                                    {result.type === 'product' ? (
                                      <div className="flex gap-2 text-sm text-gray-400">
                                        <span className="truncate">{result.category}</span>
                                        <span>•</span>
                                        <span>{result.price}</span>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 text-sm text-gray-400">
                                        <span className="text-[#F4A024]">Supplier</span>
                                        <span>•</span>
                                        <span>{result.country}</span>
                                        {result.product_count !== undefined && (
                                          <>
                                            <span>•</span>
                                            <span>{result.product_count} products</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm p-4">
                            No {searchMode} found. Try different keywords or browse categories.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}