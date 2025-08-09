import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { productsIndex, suppliersIndex } from '../lib/meilisearch';
import ProductCard from '../components/ProductCard';
import SupplierCard from '../components/SupplierCard';
import StandardFilters from '../components/StandardFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import type { Product } from '../types';
import { logError } from '../lib/errorLogging';
import { logSearchQuery } from '../lib/searchLogger';
import { analytics } from '../lib/analytics';
import { Package, Building2 } from 'lucide-react';

interface FilterOption {
  id: string;
  title: string;
  count: number;
}

interface FilterGroup {
  title: string;
  options: FilterOption[];
  selected: string[];
}

interface Supplier {
  Supplier_ID: string;
  Supplier_Title: string;
  Supplier_Description?: string;
  Supplier_Country_Name?: string;
  Supplier_City_Name?: string;
  Supplier_Location?: string;
  product_count?: number;
  product_keywords?: string;
  sourceTitle?: string;
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const mode = searchParams.get('mode') || 'products';
  const categoryId = searchParams.get('category');
  const source = searchParams.get('source');
  const country = searchParams.get('country');
  
  const [results, setResults] = useState<(Product | Supplier)[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  const [countryName, setCountryName] = useState<string>('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [suggestedSearches, setSuggestedSearches] = useState<string[]>([]);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<'products' | 'suppliers'>(
    mode === 'suppliers' ? 'suppliers' : 'products'
  );
  const queryClient = useQueryClient();
  
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

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 100;

  // Use react-query to fetch search results
  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['searchResults', { 
      query, 
      mode: currentDisplayMode, 
      categoryId, 
      source, 
      country 
    }],
    queryFn: async () => {
      // This function will be called when the query key changes
      // or when the data is stale
      
      let productsData: any[] = [];
      let suppliersData: any[] = [];
      let productsCount = 0;
      let suppliersCount = 0;

      // Fetch products data
      if (currentDisplayMode === 'products') {
        if (source) {
          const { data, error, count } = await supabase
            .from('Products')
            .select(`
              Product_ID,
              Product_Title,
              Product_Price,
              Product_Image_URL,
              Product_URL,
              Product_MOQ,
              Product_Country_Name,
              Product_Category_Name,
              Product_Supplier_Name,
              Product_Source_Name
            `, { count: 'exact' })
            .eq('Product_Source_ID', source)
            .order('Product_ID')
            .limit(ITEMS_PER_PAGE);

          if (error) throw error;
          productsData = data || [];
          productsCount = count || 0;
        } else if (categoryId) {
          const { data, error, count } = await supabase
            .from('Products')
            .select(`
              Product_ID,
              Product_Title,
              Product_Price,
              Product_Image_URL,
              Product_URL,
              Product_MOQ,
              Product_Country_Name,
              Product_Category_Name,
              Product_Supplier_Name,
              Product_Source_Name
            `, { count: 'exact' })
            .eq('Product_Category_ID', categoryId)
            .order('Product_ID')
            .limit(ITEMS_PER_PAGE);

          if (error) throw error;
          productsData = data || [];
          productsCount = count || 0;
        } else if (country) {
          const { data, error, count } = await supabase
            .from('Products')
            .select(`
              Product_ID,
              Product_Title,
              Product_Price,
              Product_Image_URL,
              Product_URL,
              Product_MOQ,
              Product_Country_Name,
              Product_Category_Name,
              Product_Supplier_Name,
              Product_Source_Name
            `, { count: 'exact' })
            .eq('Product_Country_ID', country)
            .order('Product_ID')
            .limit(ITEMS_PER_PAGE);

          if (error) throw error;
          productsData = data || [];
          productsCount = count || 0;
        } else if (query) {
          const searchResults = await productsIndex.search(query, {
            limit: ITEMS_PER_PAGE,
            facets: ['supplier', 'source', 'country']
          });

          productsData = searchResults.hits;
          productsCount = searchResults.estimatedTotalHits || 0;
        }
      }
      
      // Fetch suppliers data
      if (currentDisplayMode === 'suppliers') {
        if (query) {
          const searchResults = await suppliersIndex.search(query, {
            limit: ITEMS_PER_PAGE,
            facets: ['Supplier_Country_Name', 'Supplier_Source_ID']
          });

          suppliersData = searchResults.hits;
          suppliersCount = searchResults.estimatedTotalHits || 0;
        } else if (country) {
          const { data, error, count } = await supabase
            .from('Supplier')
            .select(`
              Supplier_ID,
              Supplier_Title,
              Supplier_Description,
              Supplier_Location,
              Supplier_Country_Name,
              Supplier_City_Name,
              Supplier_Source_ID
            `, { count: 'exact' })
            .eq('Supplier_Country_ID', country)
            .order('Supplier_Title')
            .limit(ITEMS_PER_PAGE);

          if (error) throw error;
          suppliersData = data || [];
          suppliersCount = count || 0;
        } else if (source) {
          const { data, error, count } = await supabase
            .from('Supplier')
            .select(`
              Supplier_ID,
              Supplier_Title,
              Supplier_Description,
              Supplier_Location,
              Supplier_Country_Name,
              Supplier_City_Name,
              Supplier_Source_ID
            `, { count: 'exact' })
            .eq('Supplier_Source_ID', source)
            .order('Supplier_Title')
            .limit(ITEMS_PER_PAGE);

          if (error) throw error;
          suppliersData = data || [];
          suppliersCount = count || 0;
        }
      }
      
      return {
        productsData,
        suppliersData,
        productsCount,
        suppliersCount
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Generate product-centric search suggestions
  const generateSuggestions = (results: (Product | Supplier)[], searchQuery: string, searchMode: string) => {
    if (!results.length || !searchQuery.trim()) {
      setSuggestedSearches([]);
      return;
    }

    const suggestions = new Set<string>();
    const queryLower = searchQuery.toLowerCase();

    if (searchMode === 'products') {
      // Enhanced product-centric suggestions
      const materialTerms = new Set<string>();
      const applicationTerms = new Set<string>();
      const categoryTerms = new Set<string>();

      // Define material keywords to look for - EXPANDED LIST
      const materialKeywords = [
        // Metals
        'aluminum', 'steel', 'iron', 'copper', 'brass', 'bronze', 'titanium', 'zinc',
        'stainless', 'carbon', 'alloy', 'metal', 'metallic', 'chrome', 'silver', 'gold',
        'nickel', 'tin', 'lead', 'magnesium', 'tungsten',
        
        // Plastics and Polymers
        'plastic', 'polymer', 'pvc', 'polyethylene', 'polypropylene', 'acrylic', 'nylon',
        'abs', 'polycarbonate', 'vinyl', 'resin', 'fiberglass', 'composite',
        
        // Natural Materials
        'wood', 'bamboo', 'cotton', 'leather', 'wool', 'silk', 'linen', 'jute', 'hemp',
        'rubber', 'silicone', 'ceramic', 'glass', 'stone', 'marble', 'granite',
        
        // Textiles
        'fabric', 'textile', 'polyester', 'denim', 'canvas', 'felt', 'fleece', 'velvet',
        'satin', 'suede', 'microfiber', 'mesh',
        
        // Paper Products
        'paper', 'cardboard', 'paperboard', 'corrugated',
        
        // Construction Materials
        'concrete', 'cement', 'brick', 'tile', 'grout', 'drywall', 'plywood', 'lumber',
        'insulation', 'asphalt', 'gypsum'
      ];

      // Define application/use keywords - EXPANDED LIST
      const applicationKeywords = [
        // Industries
        'industrial', 'automotive', 'construction', 'medical', 'electronic', 'electrical',
        'agricultural', 'aerospace', 'marine', 'military', 'commercial', 'residential',
        'manufacturing', 'mining', 'oil', 'gas', 'chemical', 'pharmaceutical',
        
        // Locations
        'kitchen', 'bathroom', 'bedroom', 'living', 'office', 'garage', 'garden', 'outdoor',
        'indoor', 'home', 'school', 'hospital', 'restaurant', 'hotel', 'retail',
        
        // Functions
        'packaging', 'storage', 'transport', 'safety', 'security', 'cleaning', 'heating',
        'cooling', 'lighting', 'plumbing', 'ventilation', 'insulation', 'decoration',
        'protection', 'measurement', 'monitoring', 'control', 'automation', 'communication',
        
        // Product Types
        'tool', 'machine', 'equipment', 'device', 'system', 'component', 'accessory',
        'furniture', 'appliance', 'instrument', 'container', 'vehicle', 'clothing',
        'footwear', 'hardware', 'software', 'supply', 'part', 'assembly'
      ];

      // Product attributes
      const attributeKeywords = [
        'portable', 'handheld', 'wireless', 'rechargeable', 'disposable', 'reusable',
        'adjustable', 'foldable', 'collapsible', 'expandable', 'modular', 'customizable',
        'waterproof', 'weatherproof', 'fireproof', 'shockproof', 'dustproof', 'rustproof',
        'lightweight', 'heavy-duty', 'high-capacity', 'high-performance', 'energy-efficient',
        'eco-friendly', 'biodegradable', 'organic', 'natural', 'synthetic', 'handmade',
        'digital', 'smart', 'automatic', 'manual', 'mechanical', 'hydraulic', 'pneumatic',
        'electric', 'solar', 'battery-powered', 'cordless', 'corded'
      ];

      (results as Product[]).forEach(product => {
        const productName = product.name.toLowerCase();
        const category = product.category.toLowerCase();

        // Extract material terms
        materialKeywords.forEach(material => {
          if (productName.includes(material) && !queryLower.includes(material)) {
            materialTerms.add(material);
          }
        });

        // Extract application terms
        applicationKeywords.forEach(application => {
          if (productName.includes(application) && !queryLower.includes(application)) {
            applicationTerms.add(application);
          }
        });

        // Add relevant categories (but filter out generic ones)
        if (category !== 'unknown' && 
            !category.includes(queryLower) && 
            !queryLower.includes(category) &&
            category.length > 3) {
          categoryTerms.add(product.category);
        }

        // Extract specific product terms from names
        const words = productName.split(/[\s\-_,\.()]+/)
          .filter(word => 
            word.length > 3 && 
            word.length < 15 && // Avoid very long words
            !word.includes(queryLower) && 
            !queryLower.includes(word) &&
            // Enhanced stop words for better filtering
            !['with', 'from', 'made', 'high', 'quality', 'premium', 'best', 'new', 'old', 
              'large', 'small', 'mini', 'micro', 'super', 'ultra', 'professional',
              'standard', 'heavy', 'light', 'strong', 'durable', 'portable',
              'electric', 'manual', 'automatic', 'digital', 'analog', 'this', 'that',
              'these', 'those', 'they', 'them', 'their', 'there', 'here', 'where',
              'when', 'what', 'which', 'who', 'whom', 'whose', 'why', 'how', 'have',
              'has', 'had', 'does', 'did', 'doing', 'done', 'been', 'being', 'would',
              'could', 'should', 'will', 'shall', 'may', 'might', 'must', 'can'].includes(word) &&
            // Avoid numbers and codes
            !/^\d+$/.test(word) &&
            !/^[a-z]\d+/.test(word)
          );
        
        words.forEach(word => {
          // Check if this word appears in multiple products (relevance filter)
          const wordCount = (results as Product[]).filter(p => 
            p.name.toLowerCase().includes(word)
          ).length;
          
          if (wordCount >= 2) {
            materialTerms.add(word);
          }
        });
      });

      // Prioritize suggestions by relevance
      // 1. Material terms (most specific)
      const sortedMaterials = Array.from(materialTerms)
        .sort((a, b) => {
          const countA = (results as Product[]).filter(p => p.name.toLowerCase().includes(a)).length;
          const countB = (results as Product[]).filter(p => p.name.toLowerCase().includes(b)).length;
          return countB - countA;
        });

      // 2. Application terms
      const sortedApplications = Array.from(applicationTerms)
        .sort((a, b) => {
          const countA = (results as Product[]).filter(p => p.name.toLowerCase().includes(a)).length;
          const countB = (results as Product[]).filter(p => p.name.toLowerCase().includes(b)).length;
          return countB - countA;
        });

      // 3. Category terms (least priority)
      const sortedCategories = Array.from(categoryTerms)
        .sort((a, b) => {
          const countA = (results as Product[]).filter(p => p.category === a).length;
          const countB = (results as Product[]).filter(p => p.category === b).length;
          return countB - countA;
        });

      // Add suggestions in order of priority
      [...sortedMaterials.slice(0, 2), ...sortedApplications.slice(0, 1), ...sortedCategories.slice(0, 1)]
        .slice(0, 3)
        .forEach(term => {
          const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
          suggestions.add(displayTerm);
        });

    } else {
      // For suppliers, focus on industry and capability terms
      const industryTerms = new Set<string>();
      const capabilityTerms = new Set<string>();
      const locationTerms = new Set<string>();

      // Enhanced industry keywords
      const industryKeywords = [
        'manufacturing', 'production', 'export', 'import', 'wholesale', 'retail',
        'distribution', 'logistics', 'supply', 'trading', 'sourcing', 'procurement',
        'fabrication', 'assembly', 'processing', 'packaging', 'shipping', 'consulting',
        'engineering', 'design', 'development', 'research', 'testing', 'certification',
        'quality', 'inspection', 'maintenance', 'repair', 'installation', 'service',
        'textile', 'apparel', 'furniture', 'electronics', 'automotive', 'construction',
        'agricultural', 'chemical', 'pharmaceutical', 'medical', 'food', 'beverage',
        'cosmetic', 'plastic', 'metal', 'wood', 'paper', 'glass', 'ceramic', 'rubber'
      ];

      // Location keywords
      const locationKeywords = [
        'mexico', 'colombia', 'brazil', 'argentina', 'chile', 'peru', 'ecuador',
        'venezuela', 'bolivia', 'paraguay', 'uruguay', 'panama', 'costa rica',
        'guatemala', 'honduras', 'el salvador', 'nicaragua', 'belize', 'dominican',
        'puerto rico', 'cuba', 'jamaica', 'haiti', 'bahamas', 'guyana', 'suriname',
        'french guiana', 'guadalajara', 'monterrey', 'tijuana', 'cancun', 'merida',
        'puebla', 'queretaro', 'leon', 'mexico city', 'bogota', 'medellin', 'cali',
        'barranquilla', 'cartagena', 'sao paulo', 'rio de janeiro', 'brasilia',
        'salvador', 'fortaleza', 'belo horizonte', 'manaus', 'curitiba'
      ];

      (results as Supplier[]).forEach(supplier => {
        // Extract industry terms from supplier descriptions and keywords
        if (supplier.product_keywords) {
          const keywords = supplier.product_keywords.toLowerCase().split(/[\s,]+/)
            .filter(word => 
              word.length > 3 && 
              !word.includes(queryLower) && 
              !queryLower.includes(word) &&
              !['with', 'from', 'made', 'high', 'quality', 'and', 'the', 'for', 'our', 'we', 'are'].includes(word)
            );
          
          keywords.forEach(keyword => {
            // Check if keyword is an industry term
            if (industryKeywords.includes(keyword)) {
              industryTerms.add(keyword);
            } else {
              // Otherwise add to general capability terms
              capabilityTerms.add(keyword);
            }
          });
        }

        // Extract location terms
        if (supplier.Supplier_Country_Name) {
          const location = supplier.Supplier_Country_Name.toLowerCase();
          locationKeywords.forEach(loc => {
            if (location.includes(loc) && !queryLower.includes(loc)) {
              locationTerms.add(loc);
            }
          });
        }

        if (supplier.Supplier_City_Name) {
          const city = supplier.Supplier_City_Name.toLowerCase();
          locationKeywords.forEach(loc => {
            if (city.includes(loc) && !queryLower.includes(loc)) {
              locationTerms.add(loc);
            }
          });
        }

        // Extract capability terms from supplier names and descriptions
        if (supplier.Supplier_Description) {
          const description = supplier.Supplier_Description.toLowerCase();
          
          // Check for industry keywords in description
          industryKeywords.forEach(industry => {
            if (description.includes(industry) && !queryLower.includes(industry)) {
              industryTerms.add(industry);
            }
          });
          
          // Extract other meaningful words
          const words = description.split(/[\s\-_,\.]+/)
            .filter(word => 
              word.length > 4 && 
              !word.includes(queryLower) && 
              !queryLower.includes(word) &&
              !['with', 'from', 'made', 'high', 'quality', 'and', 'the', 'for', 'our', 'we', 'are',
                'that', 'this', 'these', 'those', 'they', 'them', 'their', 'there', 'here', 'where',
                'when', 'what', 'which', 'who', 'whom', 'whose', 'why', 'how', 'have', 'has', 'had'].includes(word)
            );
          
          words.forEach(word => {
            // Check if this word appears in multiple suppliers (relevance filter)
            const wordCount = (results as Supplier[]).filter(s => 
              s.Supplier_Description?.toLowerCase().includes(word)
            ).length;
            
            if (wordCount >= 2) {
              capabilityTerms.add(word);
            }
          });
        }
      });

      // Add relevant industry terms
      const relevantIndustryTerms = Array.from(industryTerms)
        .filter(term => {
          const termCount = (results as Supplier[]).filter(s => 
            s.product_keywords?.toLowerCase().includes(term) || 
            s.Supplier_Description?.toLowerCase().includes(term)
          ).length;
          return termCount >= 2;
        })
        .sort((a, b) => {
          const countA = (results as Supplier[]).filter(s => 
            s.product_keywords?.toLowerCase().includes(a) || 
            s.Supplier_Description?.toLowerCase().includes(a)
          ).length;
          const countB = (results as Supplier[]).filter(s => 
            s.product_keywords?.toLowerCase().includes(b) || 
            s.Supplier_Description?.toLowerCase().includes(b)
          ).length;
          return countB - countA;
        });

      // Add relevant location terms
      const relevantLocationTerms = Array.from(locationTerms)
        .sort((a, b) => {
          const countA = (results as Supplier[]).filter(s => 
            s.Supplier_Country_Name?.toLowerCase().includes(a) || 
            s.Supplier_City_Name?.toLowerCase().includes(a) ||
            s.Supplier_Location?.toLowerCase().includes(a)
          ).length;
          const countB = (results as Supplier[]).filter(s => 
            s.Supplier_Country_Name?.toLowerCase().includes(b) || 
            s.Supplier_City_Name?.toLowerCase().includes(b) ||
            s.Supplier_Location?.toLowerCase().includes(b)
          ).length;
          return countB - countA;
        });

      // Add relevant capability terms
      const relevantCapabilityTerms = Array.from(capabilityTerms)
        .sort((a, b) => {
          const countA = (results as Supplier[]).filter(s => 
            s.Supplier_Description?.toLowerCase().includes(a) || 
            s.product_keywords?.toLowerCase().includes(a)
          ).length;
          const countB = (results as Supplier[]).filter(s => 
            s.Supplier_Description?.toLowerCase().includes(b) || 
            s.product_keywords?.toLowerCase().includes(b)
          ).length;
          return countB - countA;
        });

      // Combine the most relevant terms from each category
      [...relevantIndustryTerms.slice(0, 1), ...relevantLocationTerms.slice(0, 1), ...relevantCapabilityTerms.slice(0, 1)]
        .slice(0, 3)
        .forEach(term => {
          const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
          suggestions.add(displayTerm);
        });
    }

    setSuggestedSearches(Array.from(suggestions).slice(0, 3));
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Log the suggested search query
    logSearchQuery(suggestion, currentDisplayMode);
    
    // Navigate to a new search with the suggested term
    const searchParams = new URLSearchParams({
      q: suggestion,
      mode: currentDisplayMode
    });
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleDisplayModeToggle = (mode: 'products' | 'suppliers') => {
    setCurrentDisplayMode(mode);
    
    // Update URL search params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', mode);
    setSearchParams(newParams, { replace: true });
    
    // Reset pagination
    setCurrentPage(0);
    
    // Update displayed results based on the new mode
    updateDisplayedResults(mode);
    
    // Track the mode change
    analytics.trackEvent('search_mode_toggle', {
      props: { 
        mode,
        from: currentDisplayMode,
        query: query || '',
        category: categoryId || '',
        source: source || '',
        country: country || ''
      }
    });
  };

  useEffect(() => {
    async function fetchNames() {
      if (categoryId) {
        const { data, error } = await supabase
          .from('Categories')
          .select('Category_Name')
          .eq('Category_ID', categoryId)
          .single();

        if (error) {
          console.error('Error fetching category:', error);
          return;
        }

        if (data) {
          setCategoryName(data.Category_Name);
        }
      }

      if (source) {
        const { data, error } = await supabase
          .from('Sources')
          .select('Source_Title')
          .eq('Source_ID', source)
          .single();

        if (error) {
          console.error('Error fetching source:', error);
          return;
        }

        if (data) {
          setSourceName(data.Source_Title);
        }
      }

      if (country) {
        const { data, error } = await supabase
          .from('Countries')
          .select('Country_Title')
          .eq('Country_ID', country)
          .single();

        if (error) {
          console.error('Error fetching country:', error);
          return;
        }

        if (data) {
          setCountryName(data.Country_Title);
        }
      }
    }

    fetchNames();
  }, [categoryId, source, country]);

  // Function to load all results
  const loadAllResults = async () => {
    setLoading(true);
    setResults([]);
    setAllProducts([]);
    setAllSuppliers([]);
    setCurrentPage(0);
    setHasMore(true);

    try {
      console.log(`Loading all results for search... (mode: ${currentDisplayMode})`);
      
      // Always fetch both products and suppliers data
      let productsData: any[] = [];
      let suppliersData: any[] = [];
      let productsCount = 0;
      let suppliersCount = 0;

      // Fetch products data
      if (source) {
        console.log('Loading products for source:', source);
        
        const { data, error, count } = await supabase
          .from('Products')
          .select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          `, { count: 'exact' })
          .eq('Product_Source_ID', source)
          .order('Product_ID');

        if (error) throw error;
        productsData = data || [];
        productsCount = count || 0;
      } else if (categoryId) {
        console.log('Loading products for category:', categoryId);
        
        const { data, error, count } = await supabase
          .from('Products')
          .select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          `, { count: 'exact' })
          .eq('Product_Category_ID', categoryId)
          .order('Product_ID');

        if (error) throw error;
        productsData = data || [];
        productsCount = count || 0;
      } else if (country) {
        console.log('Loading products for country:', country);
        
        const { data, error, count } = await supabase
          .from('Products')
          .select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          `, { count: 'exact' })
          .eq('Product_Country_ID', country)
          .order('Product_ID');

        if (error) throw error;
        productsData = data || [];
        productsCount = count || 0;
      } else if (query) {
        // For text searches, use Meilisearch to get all results
        console.log('Loading products for text search:', query);
        
        const searchResults = await productsIndex.search(query, {
          limit: 10000, // Get all results
          facets: ['supplier', 'source', 'country']
        });

        productsData = searchResults.hits;
        productsCount = searchResults.estimatedTotalHits || 0;
      }

      // Fetch suppliers data
      if (query) {
        console.log('Loading suppliers for text search:', query);
        
        const searchResults = await suppliersIndex.search(query, {
          limit: 10000, // Get all results
          facets: ['Supplier_Country_Name', 'Supplier_Source_ID']
        });

        suppliersData = searchResults.hits;
        suppliersCount = searchResults.estimatedTotalHits || 0;
      } else if (country) {
        console.log('Loading suppliers for country:', country);
        
        const { data, error, count } = await supabase
          .from('Supplier')
          .select(`
            Supplier_ID,
            Supplier_Title,
            Supplier_Description,
            Supplier_Location,
            Supplier_Country_Name,
            Supplier_City_Name,
            Supplier_Source_ID
          `, { count: 'exact' })
          .eq('Supplier_Country_ID', country)
          .order('Supplier_Title');

        if (error) throw error;
        suppliersData = data || [];
        suppliersCount = count || 0;
      } else if (source) {
        console.log('Loading suppliers for source:', source);
        
        const { data, error, count } = await supabase
          .from('Supplier')
          .select(`
            Supplier_ID,
            Supplier_Title,
            Supplier_Description,
            Supplier_Location,
            Supplier_Country_Name,
            Supplier_City_Name,
            Supplier_Source_ID
          `, { count: 'exact' })
          .eq('Supplier_Source_ID', source)
          .order('Supplier_Title');

        if (error) throw error;
        suppliersData = data || [];
        suppliersCount = count || 0;
      }

      // Extract unique source IDs for batch fetching
      const sourceIds = [...new Set(
        suppliersData
          .map(supplier => supplier.Supplier_Source_ID)
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

      // Format product results
      const formattedProducts = productsData.map(product => ({
        id: product.Product_ID || product.id,
        name: product.Product_Title || product.title,
        Product_Price: product.Product_Price || product.price || '$0',
        image: product.Product_Image_URL || product.image || '',
        country: product.Product_Country_Name || product.country || 'Unknown',
        category: product.Product_Category_Name || product.category || 'Unknown',
        supplier: product.Product_Supplier_Name || product.supplier || 'Unknown',
        Product_MOQ: product.Product_MOQ || product.moq || '0',
        sourceUrl: product.Product_URL || product.url || '',
        marketplace: product.Product_Source_Name || product.source || 'Unknown'
      }));

      // Format supplier results
      const formattedSuppliers = suppliersData.map(supplier => ({
        Supplier_ID: supplier.Supplier_ID,
        Supplier_Title: supplier.Supplier_Title,
        Supplier_Description: supplier.Supplier_Description || '',
        Supplier_Country_Name: supplier.Supplier_Country_Name || 'Unknown',
        Supplier_City_Name: supplier.Supplier_City_Name || '',
        Supplier_Location: supplier.Supplier_Location || '',
        product_count: supplier.product_count || 0,
        product_keywords: supplier.product_keywords || '',
        sourceTitle: sourceTitles[supplier.Supplier_Source_ID] || 'Unknown Source'
      }));

      // Store all fetched data
      setAllProducts(formattedProducts);
      setAllSuppliers(formattedSuppliers);
      
      // Set total count based on current display mode
      setTotalCount(currentDisplayMode === 'products' ? productsCount : suppliersCount);
      
      // Generate suggestions based on the current display mode
      if (currentDisplayMode === 'products') {
        generateSuggestions(formattedProducts, query, 'products');
      } else {
        generateSuggestions(formattedSuppliers, query, 'suppliers');
      }
      
      // Update displayed results based on current display mode
      updateDisplayedResults(currentDisplayMode);
      
      // Log the search query
      if (query) {
        logSearchQuery(query, currentDisplayMode);
      }
    } catch (err) {
      console.error('Search error:', err);
      logError(err instanceof Error ? err : new Error('Search failed'), {
        type: 'search_error',
        query,
        category: categoryId,
        source,
        country,
        mode: currentDisplayMode
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAllResults();
  }, [query, categoryId, source, country]);

  // Update filter options based on all results
  useEffect(() => {
    if (currentDisplayMode === 'suppliers') {
      const countryCounts = new Map();
      const sourceCounts = new Map();

      allSuppliers.forEach(supplier => {
        if (supplier.Supplier_Country_Name) {
          countryCounts.set(supplier.Supplier_Country_Name, (countryCounts.get(supplier.Supplier_Country_Name) || 0) + 1);
        }
        if (supplier.sourceTitle) {
          sourceCounts.set(supplier.sourceTitle, (sourceCounts.get(supplier.sourceTitle) || 0) + 1);
        }
      });

      setFilters(prev => ({
        ...prev,
        categories: { ...prev.categories, options: [] },
        suppliers: { ...prev.suppliers, options: [] },
        countries: {
          ...prev.countries,
          options: Array.from(countryCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count: count as number
          }))
        },
        sources: {
          ...prev.sources,
          options: Array.from(sourceCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count: count as number
          }))
        }
      }));
    } else {
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
          options: Array.from(categoryCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count: count as number
          }))
        },
        suppliers: {
          ...prev.suppliers,
          options: Array.from(supplierCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count: count as number
          }))
        },
        sources: {
          ...prev.sources,
          options: Array.from(sourceCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count: count as number
          }))
        },
        countries: {
          ...prev.countries,
          options: Array.from(countryCounts.entries()).map(([title, count]) => ({
            id: title,
            title,
            count: count as number
          }))
        }
      }));
    }
  }, [allProducts, allSuppliers, currentDisplayMode]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        loadMoreResults();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, currentPage]);

  const loadMoreResults = () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Apply filters and sorting to get the filtered results
    const filteredResults = getFilteredAndSortedResults(currentDisplayMode);
    const newResults = filteredResults.slice(startIndex, endIndex);
    
    setResults(prev => [...prev, ...newResults]);
    setCurrentPage(nextPage);
    setHasMore(endIndex < filteredResults.length);
    setLoadingMore(false);
  };

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
    
    // Reset pagination when filters change
    setCurrentPage(0);
    updateDisplayedResults(currentDisplayMode);
  };

  const getFilteredAndSortedResults = (displayMode: 'products' | 'suppliers') => {
    if (displayMode === 'suppliers') {
      let filtered = allSuppliers.filter(supplier => {
        const matchesCountry = filters.countries.selected.length === 0 || 
          filters.countries.selected.includes(supplier.Supplier_Country_Name || 'Unknown');
        
        const matchesSource = filters.sources.selected.length === 0 ||
          filters.sources.selected.includes(supplier.sourceTitle || 'Unknown Source');
        
        return matchesCountry && matchesSource;
      });

      // Apply sorting for suppliers
      if (sortBy) {
        filtered = [...filtered].sort((a, b) => {
          let compareA, compareB;

          switch (sortBy) {
            case 'country':
              compareA = (a.Supplier_Country_Name || 'Unknown').toLowerCase();
              compareB = (b.Supplier_Country_Name || 'Unknown').toLowerCase();
              break;
            case 'marketplace':
              compareA = (a.sourceTitle || 'Unknown').toLowerCase();
              compareB = (b.sourceTitle || 'Unknown').toLowerCase();
              break;
            case 'products':
              compareA = a.product_count || 0;
              compareB = b.product_count || 0;
              break;
            default:
              compareA = a.Supplier_Title.toLowerCase();
              compareB = b.Supplier_Title.toLowerCase();
              break;
          }

          if (sortOrder === 'asc') {
            return compareA > compareB ? 1 : -1;
          } else {
            return compareA < compareB ? 1 : -1;
          }
        });
      }

      return filtered;
    } else {
      let filtered = allProducts.filter(product => {
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

      // Apply sorting for products
      if (sortBy) {
        filtered = [...filtered].sort((a, b) => {
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
      }

      return filtered;
    }
  };

  const updateDisplayedResults = (displayMode: 'products' | 'suppliers') => {
    const filteredResults = getFilteredAndSortedResults(displayMode);
    setResults(filteredResults.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredResults.length > ITEMS_PER_PAGE);
    setCurrentPage(0);
    
    // Update total count based on filtered results
    setTotalCount(filteredResults.length);
  };

  // Update displayed results when filters or sorting change
  useEffect(() => {
    updateDisplayedResults(currentDisplayMode);
  }, [filters, sortBy, sortOrder]);

  // Update displayed results when display mode changes
  useEffect(() => {
    updateDisplayedResults(currentDisplayMode);
  }, [currentDisplayMode]);

  const getPageTitle = () => {
    if (currentDisplayMode === 'suppliers') {
      if (country && countryName) return `Suppliers from ${countryName}`;
      if (source && sourceName) return `Suppliers from ${sourceName}`;
      return query ? `Supplier Results for "${query}"` : 'All Suppliers';
    } else {
      if (categoryId && categoryName) return `Products in ${categoryName}`;
      if (source && sourceName) return `${totalCount.toLocaleString()} Products from ${sourceName}`;
      if (country && countryName) return `Products from ${countryName}`;
      return query ? `Search Results for "${query}"` : 'All Products';
    }
  };

  const filteredResults = getFilteredAndSortedResults(currentDisplayMode);

  return (
    <>
      <SEO 
        title={getPageTitle()}
        description={`Browse ${filteredResults.length} ${currentDisplayMode === 'suppliers' ? 'suppliers' : 'products'} matching your search. Filter by ${currentDisplayMode === 'suppliers' ? 'country and source' : 'supplier, source, and country'}.`}
        keywords={`search results, ${query}, ${currentDisplayMode === 'suppliers' ? 'supplier search, filter suppliers' : 'product search, filter products'}`}
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle={getPageTitle()} />

          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <p className="text-gray-300">
                {loading ? 'Loading...' : `${filteredResults.length} of ${totalCount.toLocaleString()} results`}
                {hasMore && !loading && ` (showing ${results.length})`}
              </p>

              {/* Display Mode Toggle with "View by" text */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">View by:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDisplayModeToggle('products')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentDisplayMode === 'products'
                          ? 'bg-[#F4A024] text-gray-900'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Products
                    </button>
                    <button
                      onClick={() => handleDisplayModeToggle('suppliers')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentDisplayMode === 'suppliers'
                          ? 'bg-[#F4A024] text-gray-900'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Suppliers
                    </button>
                  </div>
                </div>

                {/* Related Searches Section */}
                {suggestedSearches.length > 0 && query && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Searches related to "{query}"
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSearches.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-[#F4A024] text-sm rounded-full transition-colors border border-gray-600/50 hover:border-[#F4A024]/50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                showCategories={currentDisplayMode === 'products'}
                showSuppliers={currentDisplayMode === 'products'}
                showSources={true}
                showCountries={true}
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            ) : results.length > 0 ? (
              <>
                {currentDisplayMode === 'suppliers' ? (
                  // Supplier results grid
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((supplier) => (
                      <SupplierCard 
                        key={supplier.Supplier_ID} 
                        supplier={supplier as Supplier} 
                      />
                    ))}
                  </div>
                ) : (
                  // Product results grid
                  <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {results.map((product) => (
                      <ProductCard key={product.id} product={product as Product} />
                    ))}
                  </div>
                )}
                
                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="text-gray-400 mt-2">Loading more results...</p>
                  </div>
                )}
                
                {/* End of results indicator */}
                {!hasMore && results.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">You've reached the end of the results</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-300 font-bold">
                  No {currentDisplayMode === 'suppliers' ? 'suppliers' : 'products'} found 
                  {categoryId ? ' in this category' : 
                   source ? ' from this source' : 
                   country ? ' from this country' : 
                   query ? ` for "${query}"` : ''}
                </p>
                <p className="text-gray-400 font-bold mt-2">
                  Try {categoryId ? 'another category' : 
                       source ? 'another source' : 
                       country ? 'another country' : 
                       'searching with different keywords'} or browse our categories
                </p>
                
                {/* Suggest switching display mode if there are results in the other mode */}
                {currentDisplayMode === 'products' && allSuppliers.length > 0 && (
                  <button
                    onClick={() => handleDisplayModeToggle('suppliers')}
                    className="mt-4 text-[#F4A024] hover:text-[#F4A024]/80 font-medium"
                  >
                    Switch to Suppliers view ({allSuppliers.length} results available)
                  </button>
                )}
                
                {currentDisplayMode === 'suppliers' && allProducts.length > 0 && (
                  <button
                    onClick={() => handleDisplayModeToggle('products')}
                    className="mt-4 text-[#F4A024] hover:text-[#F4A024]/80 font-medium"
                  >
                    Switch to Products view ({allProducts.length} results available)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}