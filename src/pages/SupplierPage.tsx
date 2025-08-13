import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Globe, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import Breadcrumbs from '../components/Breadcrumbs';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { getSupplierIdFromParams } from '../utils/urlHelpers';
import { analytics } from '../lib/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

interface SupplierData {
  Supplier_ID: string;
  Supplier_Name: string;
  Supplier_Country_ID: string;
  Supplier_Location: string;
  Supplier_Source_Name: string;
  Supplier_Website: string;
  Supplier_Email: string;
  Supplier_Whatsapp: string;
  ai_related_terms: string;
  ai_business_summary: string;
  ai_industries_supported: string;
  ai_products_services: string;
  Landing_Page_URL: string;
  Countries: {
    Country_Name: string;
    Country_Image: string;
  };
}

export default function SupplierPage() {
  const params = useParams();
  const navigate = useNavigate();
  const supplierId = getSupplierIdFromParams(params);
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [showMoreProductsOffered, setShowMoreProductsOffered] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Fetch supplier data
  const { 
    data: supplier, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      if (!supplierId) return null;
      
      const { data, error } = await supabase
        .from('Supplier')
        .select(`
          Supplier_ID,
          Supplier_Title,
          Supplier_Country_ID,
          Supplier_Location,
          Sources:Supplier_Source_ID (
            Source_Title
          ),
          Supplier_Website,
          Supplier_Email,
          Supplier_Whatsapp,
          ai_related_terms,
          ai_business_summary,
          ai_industries_supported,
          ai_products_services,
          Landing_Page_URL,
          Countries:Supplier_Country_ID (
            Country_Title,
            Country_Image
          )
        `)
        .eq('Supplier_ID', supplierId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Map the data to match our interface
      return {
        Supplier_ID: data.Supplier_ID,
        Supplier_Name: data.Supplier_Title,
        Supplier_Country_ID: data.Supplier_Country_ID,
        Supplier_Location: data.Supplier_Location,
        Supplier_Source_Name: data.Sources?.Source_Title || '',
        Supplier_Website: data.Supplier_Website,
        Supplier_Email: data.Supplier_Email,
        Supplier_Whatsapp: data.Supplier_Whatsapp,
        ai_related_terms: data.ai_related_terms,
        ai_business_summary: data.ai_business_summary,
        ai_industries_supported: data.ai_industries_supported,
        ai_products_services: data.ai_products_services,
        Landing_Page_URL: data.Landing_Page_URL,
        Countries: {
          Country_Name: data.Countries?.Country_Title || '',
          Country_Image: data.Countries?.Country_Image || ''
        }
      } as SupplierData;
    },
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch supplier products
  const { 
    data: supplierProducts = [], 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ['supplierProducts', supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      
      const { data, error } = await supabase
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
        `)
        .eq('Product_Supplier_ID', supplierId)
        .order('Product_Title')
        .limit(12); // Limit to 12 products for better performance

      if (error) throw error;
      
      // Transform to match Product interface
      return (data || []).map(product => ({
        id: product.Product_ID,
        name: product.Product_Title || 'Untitled Product',
        Product_Price: product.Product_Price || '$0',
        image: product.Product_Image_URL || '',
        country: product.Product_Country_Name || 'Unknown',
        category: product.Product_Category_Name || 'Unknown',
        supplier: product.Product_Supplier_Name || 'Unknown',
        Product_MOQ: product.Product_MOQ || '0',
        sourceUrl: product.Product_URL || '',
        marketplace: product.Product_Source_Name || 'Unknown'
      })) as Product[];
    },
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Helper functions
  const normalizePhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const parseTerms = (terms: string): string[] => {
    if (!terms?.trim()) return [];
    return terms
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0)
      .filter((term, index, arr) => arr.indexOf(term) === index); // dedupe
  };

  const parseListContent = (content: string): string[] => {
    if (!content?.trim()) return [];
    
    return content
      .split('\n')
      .flatMap(line => line.split(','))
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .filter((item, index, arr) => arr.indexOf(item) === index); // dedupe
  };

  const handleRelatedTermClick = (term: string) => {
    analytics.trackEvent('related_term_clicked', {
      term,
      supplier_id: supplierId,
      supplier_name: supplier?.Supplier_Name
    });
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!supplier) {
    return (
      <>
        <SEO 
          title="Supplier Not Found"
          description="The requested supplier could not be found. Browse our other Latin American suppliers."
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100">Supplier not found</h2>
          </div>
        </div>
      </>
    );
  }

  const relatedTerms = parseTerms(supplier.ai_related_terms);
  const industriesSupported = parseListContent(supplier.ai_products_services);
  const productsOffered = parseListContent(supplier.ai_industries_supported);
  const normalizedPhone = normalizePhoneNumber(supplier.Supplier_Whatsapp || '');
  const shouldShowWhatsApp = normalizedPhone.length >= 7;

  // Debug logging for location data
  console.log('Supplier location data:', {
    location: supplier?.Supplier_Location,
    country: supplier?.Countries?.Country_Name
  });

  // Truncate products list for "Show more" functionality
  const maxProductsToShow = 5;
  const visibleSupplierProducts = showMoreProducts ? supplierProducts : supplierProducts.slice(0, maxProductsToShow);
  const hasMoreSupplierProducts = supplierProducts.length > maxProductsToShow;

  // Truncate products offered list for "Show more" functionality
  const maxProductsOfferedToShow = 5;
  const visibleProductsOffered = showMoreProductsOffered ? productsOffered : productsOffered.slice(0, maxProductsOfferedToShow);
  const hasMoreProductsOffered = productsOffered.length > maxProductsOfferedToShow;

  return (
    <>
      <SEO 
        title={`${supplier.Supplier_Name} — ${supplier.Countries.Country_Name}`}
        description={supplier.ai_business_summary?.substring(0, 160) || `${supplier.Supplier_Name} - Latin American supplier from ${supplier.Countries.Country_Name}`}
        keywords={`${supplier.Supplier_Name}, ${supplier.Countries.Country_Name}, Latin American supplier, wholesale, B2B, ${relatedTerms.join(', ')}`}
        type="profile"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle={supplier.Supplier_Name} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  {/* Flag */}
                  <div className="flex-shrink-0">
                    {supplier.Countries.Country_Image ? (
                      <img
                        src={supplier.Countries.Country_Image}
                        alt={`${supplier.Countries.Country_Name} flag`}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-300">🏳️</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Supplier Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">
                      {supplier.Supplier_Name}
                    </h1>
                    {supplier.Supplier_Location?.trim() && (
                      <p className="text-gray-300 mb-1 font-bold">{supplier.Supplier_Location.trim()}</p>
                    )}
                    {supplier.Supplier_Source_Name?.trim() && (
                      <div className="mb-1">
                        <span className="inline-block px-2 py-1 rounded-full bg-[#F4A024]/20 text-[#F4A024] text-xs font-medium">
                          Source: {supplier.Supplier_Source_Name.trim()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {supplier.Supplier_Website?.trim() && (
                    <Button asChild>
                      <a
                        href={supplier.Supplier_Website.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  
                  {supplier.Supplier_Email?.trim() && (
                    <Button asChild>
                      <a
                        href={`mailto:${supplier.Supplier_Email.trim()}`}
                        className="bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  
                  {shouldShowWhatsApp && (
                    <Button asChild>
                      <a
                        href={`https://wa.me/${normalizedPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Related Terms */}
              {relatedTerms.length > 0 && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Related Terms</h2>
                    <div className="flex flex-wrap gap-2">
                      {relatedTerms.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleRelatedTermClick(term)}
                          className="px-3 py-1 bg-gray-700/50 hover:bg-[#F4A024]/20 text-gray-300 hover:text-[#F4A024] rounded-full text-sm transition-colors"
                          title={term}
                        >
                          {term.length > 20 ? `${term.substring(0, 20)}...` : term}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* About */}
              {supplier.ai_business_summary?.trim() && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">About</h2>
                    <p className="text-gray-300 leading-relaxed">
                      {supplier.ai_business_summary.trim()}
                    </p>
                  </div>
                </>
              )}

              {/* Website Preview - Mobile/Tablet (appears after About section) */}
              {supplier.Landing_Page_URL?.trim() && (
                <>
                  <Separator className="bg-gray-700 lg:hidden" />
                  <div className="lg:hidden">
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Website Preview</h2>
                    
                    <div className="bg-gray-700/50 rounded-lg overflow-hidden aspect-video mb-4">
                      {!imageLoadError ? (
                        <img
                          src={supplier.Landing_Page_URL.trim()}
                          alt={`Website screenshot for ${supplier.Supplier_Name}`}
                          className="w-full h-full object-cover"
                          onError={() => setImageLoadError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6">
                          <Globe className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-300 text-sm">Screenshot unavailable</p>
                        </div>
                      )}
                    </div>
                    
                    {supplier.Supplier_Website?.trim() && (
                      <div className="text-center">
                        <Button asChild>
                          <a
                            href={supplier.Supplier_Website.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Industries Supported */}
              {supplier.ai_industries_supported?.trim() && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Industries Supported</h2>
                    <ul className="space-y-2">
                      {industriesSupported.map((industry, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-[#F4A024] mr-2">•</span>
                          {industry}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Products Offered */}
              {productsOffered.length > 0 && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Products Offered</h2>
                    <ul className="space-y-2">
                      {visibleProductsOffered.map((product, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-[#F4A024] mr-2">•</span>
                          {product}
                        </li>
                      ))}
                    </ul>
                    {hasMoreProductsOffered && (
                      <button
                        onClick={() => setShowMoreProductsOffered(!showMoreProductsOffered)}
                        className="mt-4 text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium flex items-center gap-1"
                      >
                        {showMoreProductsOffered ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show more ({productsOffered.length - maxProductsOfferedToShow} more)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Products Offered */}
              {productsOffered.length > 0 && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Products Offered</h2>
                    <ul className="space-y-2">
                      {visibleProductsOffered.map((product, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-[#F4A024] mr-2">•</span>
                          {product}
                        </li>
                      ))}
                    </ul>
                    {hasMoreProductsOffered && (
                      <button
                        onClick={() => setShowMoreProductsOffered(!showMoreProductsOffered)}
                        className="mt-4 text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium flex items-center gap-1"
                      >
                        {showMoreProductsOffered ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show more ({productsOffered.length - maxProductsOfferedToShow} more)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Supplier Location Overview */}
              {supplier.Supplier_Location?.trim() && supplier.Countries.Country_Name && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Supplier Location Overview</h2>
                    <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                          `${supplier.Supplier_Location.trim()}, ${supplier.Countries.Country_Name}`
                        )}&zoom=10`}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map showing general area of ${supplier.Supplier_Name}`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      This map shows the general area where the supplier is located for reference purposes.
                    </p>
                  </div>
                </>
              )}

              {/* Supplier Products Section */}
              <>
                <Separator className="bg-gray-700" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">
                    Supplier Products
                    {supplierProducts.length > 0 && (
                      <span className="text-sm font-normal text-gray-400 ml-2">
                        ({supplierProducts.length} {supplierProducts.length === 1 ? 'product' : 'products'})
                      </span>
                    )}
                  </h2>
                  
                  {productsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : supplierProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleSupplierProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                      {hasMoreSupplierProducts && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => setShowMoreProducts(!showMoreProducts)}
                            className="text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium flex items-center gap-1 mx-auto"
                          >
                            {showMoreProducts ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show more ({supplierProducts.length - maxProductsToShow} more)
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-700/30 rounded-lg">
                      <p className="text-gray-400">No products found for this supplier.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Products may not be available in our current catalog.
                      </p>
                    </div>
                  )}
                </div>
              </>
            </div>

            {/* Right Column - Website Preview (Desktop only) */}
            <div className="lg:col-span-1">
              {supplier.Landing_Page_URL?.trim() && (
                <div className="hidden lg:block lg:sticky lg:top-24">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">Website Preview</h2>
                    
                    <div className="bg-gray-700/50 rounded-lg overflow-hidden aspect-video mb-4">
                      {!imageLoadError ? (
                        <img
                          src={supplier.Landing_Page_URL.trim()}
                          alt={`Website screenshot for ${supplier.Supplier_Name}`}
                          className="w-full h-full object-cover"
                          onError={() => setImageLoadError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6">
                          <Globe className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-300 text-sm">Screenshot unavailable</p>
                        </div>
                      )}
                    </div>
                    
                    {supplier.Supplier_Website?.trim() && (
                      <div className="text-center">
                        <Button asChild>
                          <a
                            href={supplier.Supplier_Website.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}