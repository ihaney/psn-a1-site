import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, Building2, MapPin, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import { createSupplierUrl } from '../utils/urlHelpers';
import { supabase } from '../lib/supabase';

interface SupplierListItem {
  Supplier_ID: string;
  Supplier_Title: string;
  Supplier_Description: string;
  Supplier_Website: string;
  Supplier_Email: string;
  Supplier_Location: string;
  Supplier_Whatsapp: string;
  Supplier_Country_Name: string;
  Supplier_City_Name: string;
  Supplier_Source_ID: string;
  product_count?: number;
}

interface FilterOption {
  id: string;
  name: string;
}

interface FilterGroup {
  title: string;
  key: string;
  options: FilterOption[];
  selected: string[];
}

const SUPPLIERS_PER_PAGE = 50;

export default function SuppliersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [facetOptions, setFacetOptions] = useState<{
    countries: FilterOption[];
    sources: FilterOption[];
  }>({ countries: [], sources: [] });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Fetch all sources for mapping Source_ID to Source_Title
  const { data: allSourcesMap } = useQuery({
    queryKey: ['allSourcesMap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Sources')
        .select('Source_ID, Source_Title');
      if (error) {
        console.error('Error fetching all sources:', error);
        return {};
      }
      return (data || []).reduce((acc, source) => {
        acc[source.Source_ID] = source.Source_Title;
        return acc;
      }, {} as Record<string, string>);
    },
    staleTime: Infinity,
  });

  // Fetch filter options (distinct countries and sources)
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        // Fetch distinct countries
        const { data: countriesData, error: countriesError } = await supabase
          .from('Supplier')
          .select('Supplier_Country_Name')
          .not('Supplier_Country_Name', 'is', null)
          .not('Supplier_Country_Name', 'eq', '');

        if (countriesError) {
          console.error('Error fetching countries:', countriesError);
        } else {
          const uniqueCountries = [...new Set(countriesData?.map(item => item.Supplier_Country_Name) || [])];
          setFacetOptions(prev => ({
            ...prev,
            countries: uniqueCountries.map(country => ({
              id: country,
              name: country
            })).sort((a, b) => a.name.localeCompare(b.name))
          }));
        }

        // Fetch distinct sources
        const { data: sourcesData, error: sourcesError } = await supabase
          .from('Supplier')
          .select('Supplier_Source_ID')
          .not('Supplier_Source_ID', 'is', null)
          .not('Supplier_Source_ID', 'eq', '');

        if (sourcesError) {
          console.error('Error fetching sources:', sourcesError);
        } else {
          const uniqueSourceIds = [...new Set(sourcesData?.map(item => item.Supplier_Source_ID) || [])];
          setFacetOptions(prev => ({
            ...prev,
            sources: uniqueSourceIds.map(sourceId => ({
              id: sourceId,
              name: allSourcesMap?.[sourceId] || sourceId
            })).sort((a, b) => a.name.localeCompare(b.name))
          }));
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }

    if (allSourcesMap) {
      fetchFilterOptions();
    }
  }, [allSourcesMap]);

  // Main suppliers query with filtering and sorting
  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliersList', currentPage, activeFilters, sortBy],
    queryFn: async () => {
      const from = currentPage * SUPPLIERS_PER_PAGE;
      const to = from + SUPPLIERS_PER_PAGE - 1;

      // Start building the query
      let supabaseQuery = supabase
        .from('Supplier')
        .select('*', { count: 'exact' })
        .range(from, to);

      // Apply filters
      Object.entries(activeFilters).forEach(([filterKey, filterValues]) => {
        if (filterValues.length > 0) {
          if (filterKey === 'Supplier_Country_Name') {
            supabaseQuery = supabaseQuery.in('Supplier_Country_Name', filterValues);
          } else if (filterKey === 'Supplier_Source_ID') {
            supabaseQuery = supabaseQuery.in('Supplier_Source_ID', filterValues);
          }
        }
      });

      // Apply sorting
      if (sortBy === 'product_count:desc') {
        // For product count sorting, we need to use a different approach
        // since we can't directly sort by the count from the join
        supabaseQuery = supabaseQuery.order('Supplier_Title', { ascending: true });
      } else if (sortBy === 'product_count:asc') {
        supabaseQuery = supabaseQuery.order('Supplier_Title', { ascending: true });
      } else {
        // Default to alphabetical by supplier title
        supabaseQuery = supabaseQuery.order('Supplier_Title', { ascending: true });
      }

      const { data: suppliersData, error: suppliersError, count } = await supabaseQuery;

      if (suppliersError) {
        console.error('Error fetching suppliers:', suppliersError);
        throw suppliersError;
      }

      // Get product counts for each supplier
      const suppliersWithCounts = await Promise.all(
        (suppliersData || []).map(async (supplier) => {
          const { count: productCount } = await supabase
            .from('Products')
            .select('*', { count: 'exact', head: true })
            .eq('Product_Supplier_ID', supplier.Supplier_ID);

          return {
            Supplier_ID: supplier.Supplier_ID,
            Supplier_Title: supplier.Supplier_Title || 'Unknown Supplier',
            Supplier_Description: supplier.Supplier_Description || '',
            Supplier_Website: supplier.Supplier_Website || '',
            Supplier_Email: supplier.Supplier_Email || '',
            Supplier_Location: supplier.Supplier_Location || '',
            Supplier_Whatsapp: supplier.Supplier_Whatsapp || '',
            Supplier_Country_Name: supplier.Supplier_Country_Name || 'Unknown',
            Supplier_City_Name: supplier.Supplier_City_Name || '',
            Supplier_Source_ID: supplier.Supplier_Source_ID || '',
            product_count: productCount || 0
          };
        })
      );

      // Apply product count sorting after fetching counts
      let sortedSuppliers = suppliersWithCounts;
      if (sortBy === 'product_count:desc') {
        sortedSuppliers = suppliersWithCounts.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
      } else if (sortBy === 'product_count:asc') {
        sortedSuppliers = suppliersWithCounts.sort((a, b) => (a.product_count || 0) - (b.product_count || 0));
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / SUPPLIERS_PER_PAGE);
      const hasNextPage = currentPage < totalPages - 1;
      const hasPrevPage = currentPage > 0;

      return {
        data: sortedSuppliers,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const suppliers = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const hasNextPage = data?.hasNextPage || false;
  const hasPrevPage = data?.hasPrevPage || false;

  // Filter change handler
  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => {
      const currentSelection = prev[filterKey] || [];
      if (currentSelection.includes(value)) {
        return { ...prev, [filterKey]: currentSelection.filter(item => item !== value) };
      } else {
        return { ...prev, [filterKey]: [...currentSelection, value] };
      }
    });
    // Reset to first page when filters change
    setCurrentPage(0);
  };

  // Sort change handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(0); // Reset to first page when sort changes
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setCurrentPage(0);
  };

  // Calculate total active filters
  const totalActiveFilters = useMemo(() => {
    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
  }, [activeFilters]);

  // Create filter groups for the StandardFilters component
  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    // Supplier Country filter
    groups.push({
      title: 'Supplier Country',
      key: 'Supplier_Country_Name',
      options: facetOptions.countries.map(country => ({
        id: country.id,
        name: country.name,
        count: 0 // We don't show counts for performance reasons
      })),
      selected: activeFilters['Supplier_Country_Name'] || [],
    });

    // Sources filter
    groups.push({
      title: 'Sources',
      key: 'Supplier_Source_ID',
      options: facetOptions.sources.map(source => ({
        id: source.id,
        name: source.name,
        count: 0 // We don't show counts for performance reasons
      })),
      selected: activeFilters['Supplier_Source_ID'] || [],
    });

    return groups;
  }, [facetOptions, activeFilters]);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'product_count:desc', label: 'Product Count: High to Low' },
    { value: 'product_count:asc', label: 'Product Count: Low to High' },
  ];

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSupplierClick = (supplier: SupplierListItem) => {
    navigate(createSupplierUrl(supplier.Supplier_Title, supplier.Supplier_ID));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <SEO 
          title="Error Loading Suppliers"
          description="Unable to load suppliers directory. Please try again later."
        />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Error Loading Suppliers</h1>
            <p className="text-gray-300">Please try refreshing the page.</p>
            <p className="text-sm text-gray-400 mt-2">{error.message}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Suppliers Directory"
        description={`Browse ${totalCount.toLocaleString()} verified Latin American suppliers. Find trusted wholesale suppliers across Latin America.`}
        keywords="Latin American suppliers, wholesale suppliers, B2B suppliers, verified suppliers"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Suppliers Directory" />

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
              {/* Results Header and Sorting */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-100">
                    Showing {suppliers.length} suppliers
                  </h1>
                  {currentPage > 0 && (
                    <p className="text-gray-400 text-sm mt-1">
                      Page {currentPage + 1} of {totalPages}
                    </p>
                  )}
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

              {/* Suppliers List */}
              {suppliers.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6" data-tour="suppliers-list">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.Supplier_ID}
                        onClick={() => handleSupplierClick(supplier)}
                        className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-[#F4A024]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F4A024]/20 transition-colors">
                              <Building2 className="w-6 h-6 text-[#F4A024]" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-[#F4A024] transition-colors">
                                  {supplier.Supplier_Title}
                                </h3>
                                
                                {supplier.Supplier_Description && (
                                  <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                                    {supplier.Supplier_Description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                  {(supplier.Supplier_Country_Name || supplier.Supplier_Location) && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>
                                        {supplier.Supplier_Location || 
                                         `${supplier.Supplier_City_Name ? supplier.Supplier_City_Name + ', ' : ''}${supplier.Supplier_Country_Name}`}
                                      </span>
                                    </div>
                                  )}
                                  {supplier.Supplier_Source_ID && allSourcesMap && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[#F4A024]">Source:</span>
                                      <span>{allSourcesMap[supplier.Supplier_Source_ID] || 'Unknown'}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {supplier.product_count !== undefined && (
                                <div className="text-right ml-4">
                                  <div className="text-lg font-semibold text-[#F4A024]">
                                    {supplier.product_count}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {supplier.product_count === 1 ? 'product' : 'products'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <button
                        onClick={handlePrevPage}
                        disabled={!hasPrevPage}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      <span className="text-gray-400">
                        Page {currentPage + 1} of {totalPages}
                      </span>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg">
                  <p className="text-gray-400">No suppliers found.</p>
                  {totalActiveFilters > 0 && (
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}