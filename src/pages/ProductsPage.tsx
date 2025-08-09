import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Zap, Shirt, Package } from 'lucide-react';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import StandardFilters from '../components/StandardFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';

interface FeaturedCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface FilterGroup {
  title: string;
  options: FilterOption[];
  selected: string[];
}

interface FilterOption {
  id: string;
  title: string;
  count: number;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    error 
  } = useProducts();
  
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([]);
  const [filters, setFilters] = useState<{
    categories: FilterGroup;
    suppliers: FilterGroup;
    sources: FilterGroup;
    countries: FilterGroup;
  }>({
    categories: { title: 'Categories', options: [], selected: [] },
    suppliers: { title: 'Suppliers', options: [], selected: [] },
    sources: { title: 'Sources', options: [], selected: [] },
    countries: { title: 'Countries', options: [], selected: [] }
  });

  // Ref for infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Flatten all products from all pages
  const allProducts = data?.pages?.flatMap(page => page?.data || []) || [];
  const totalCount = data?.pages?.[0]?.totalCount || 0;

  // Infinite scroll implementation
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  // Set up featured categories with the requested names and icons
  useEffect(() => {
    setFeaturedCategories([
      {
        id: 'industrial-tools',
        name: 'Industrial Tools & Equipment',
        icon: <Factory className="w-12 h-12 text-[#F4A024]" />,
        description: 'Professional tools and industrial equipment for manufacturing and construction'
      },
      {
        id: 'electronics',
        name: 'Electronics',
        icon: <Zap className="w-12 h-12 text-[#F4A024]" />,
        description: 'Electronic components, devices, and technology solutions'
      },
      {
        id: 'apparel-textiles',
        name: 'Apparel & Textiles',
        icon: <Shirt className="w-12 h-12 text-[#F4A024]" />,
        description: 'Clothing, fabrics, and textile products for various applications'
      },
      {
        id: 'logistics-packaging',
        name: 'Logistics & Packaging Solutions',
        icon: <Package className="w-12 h-12 text-[#F4A024]" />,
        description: 'Packaging materials, shipping solutions, and logistics services'
      }
    ]);
  }, []);

  // Fetch filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      const [categoriesData, suppliersData, sourcesData, countriesData] = await Promise.all([
        supabase.from('Categories').select('Category_ID, Category_Name').order('Category_Name'),
        supabase.from('Supplier').select('Supplier_ID, Supplier_Title').order('Supplier_Title'),
        supabase.from('Sources').select('Source_ID, Source_Title').order('Source_Title'),
        supabase.from('Countries').select('Country_ID, Country_Title').order('Country_Title')
      ]);

      if (categoriesData.data) {
        setFilters(prev => ({
          ...prev,
          categories: {
            ...prev.categories,
            options: categoriesData.data.map(c => ({
              id: c.Category_ID,
              title: c.Category_Name,
              count: 0
            }))
          }
        }));
      }

      if (suppliersData.data) {
        setFilters(prev => ({
          ...prev,
          suppliers: {
            ...prev.suppliers,
            options: suppliersData.data.map(s => ({
              id: s.Supplier_ID,
              title: s.Supplier_Title,
              count: 0
            }))
          }
        }));
      }

      if (sourcesData.data) {
        setFilters(prev => ({
          ...prev,
          sources: {
            ...prev.sources,
            options: sourcesData.data.map(s => ({
              id: s.Source_ID,
              title: s.Source_Title,
              count: 0
            }))
          }
        }));
      }

      if (countriesData.data) {
        setFilters(prev => ({
          ...prev,
          countries: {
            ...prev.countries,
            options: countriesData.data.map(c => ({
              id: c.Country_ID,
              title: c.Country_Title,
              count: 0
            }))
          }
        }));
      }
    }

    fetchFilterOptions();
  }, []);

  // Update filter counts
  useEffect(() => {
    const categoryCounts = new Map();
    const supplierCounts = new Map();
    const sourceCounts = new Map();
    const countryCounts = new Map();

    allProducts.forEach(product => {
      categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
      supplierCounts.set(product.supplier, (supplierCounts.get(product.supplier) || 0) + 1);
      sourceCounts.set(product.marketplace, (sourceCounts.get(product.marketplace) || 0) + 1);
      countryCounts.set(product.country, (countryCounts.get(product.country) || 0) + 1);
    });

    setFilters(prev => ({
      categories: {
        ...prev.categories,
        options: prev.categories.options.map(opt => ({
          ...opt,
          count: categoryCounts.get(opt.title) || 0
        }))
      },
      suppliers: {
        ...prev.suppliers,
        options: prev.suppliers.options.map(opt => ({
          ...opt,
          count: supplierCounts.get(opt.title) || 0
        }))
      },
      sources: {
        ...prev.sources,
        options: prev.sources.options.map(opt => ({
          ...opt,
          count: sourceCounts.get(opt.title) || 0
        }))
      },
      countries: {
        ...prev.countries,
        options: prev.countries.options.map(opt => ({
          ...opt,
          count: countryCounts.get(opt.title) || 0
        }))
      }
    }));
  }, [allProducts]);

  const handleFilterChange = (group: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        selected: prev[group].selected.includes(value)
          ? prev[group].selected.filter(v => v !== value)
          : [...prev[group].selected, value]
      }
    }));
  };

  const handleCategoryClick = (categoryName: string) => {
    // For now, navigate to a general search since we don't have exact category mapping
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  const filteredProducts = React.useMemo(() => {
    return allProducts.filter(product => {
      const matchesCategory = filters.categories.selected.length === 0 || 
        filters.categories.selected.includes(product.category);
      const matchesSupplier = filters.suppliers.selected.length === 0 || 
        filters.suppliers.selected.includes(product.supplier);
      const matchesSource = filters.sources.selected.length === 0 ||
        filters.sources.selected.includes(product.marketplace);
      const matchesCountry = filters.countries.selected.length === 0 ||
        filters.countries.selected.includes(product.country);

      return matchesCategory && matchesSupplier && matchesSource && matchesCountry;
    });
  }, [allProducts, filters]);

  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (!sortBy) return 0;

      let compareA, compareB;

      switch (sortBy) {
        case 'price':
          compareA = parseFloat(a.Product_Price.replace(/[^0-9.-]+/g, ''));
          compareB = parseFloat(b.Product_Price.replace(/[^0-9.-]+/g, ''));
          break;
        case 'country':
          compareA = a.country.toLowerCase();
          compareB = b.country.toLowerCase();
          break;
        case 'category':
          compareA = a.category.toLowerCase();
          compareB = b.category.toLowerCase();
          break;
        case 'marketplace':
          compareA = a.marketplace.toLowerCase();
          compareB = b.marketplace.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }, [filteredProducts, sortBy, sortOrder]);

  if (error) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error Loading Products</h1>
          <p className="text-gray-300">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="All Products"
        description="Browse our complete catalog of Latin American products. Find wholesale products from trusted suppliers across various categories."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Featured Categories</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer group bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-300">{category.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">All Products</h2>
                <p className="text-gray-400">
                  Showing {sortedProducts.length} of {totalCount.toLocaleString()} products
                </p>
              </div>
              <StandardFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            </div>

            {isLoading && allProducts.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : sortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="flex justify-center py-8">
                  {isFetchingNextPage && <LoadingSpinner />}
                  {!hasNextPage && allProducts.length > 0 && (
                    <p className="text-gray-400 text-sm">You've reached the end of the catalog</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-300 font-bold">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}