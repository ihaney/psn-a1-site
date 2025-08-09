import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Building2, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import { productsIndex, suppliersIndex } from '../lib/meilisearch';
import { SearchTerm } from '../types';
import LoadingSpinner from './LoadingSpinner';

export default function SearchTermColumns() {
  const navigate = useNavigate();

  const { data: searchTerms, isLoading, error } = useQuery({
    queryKey: ['searchTerms'],
    queryFn: async () => {
      // Fetch search terms from the database
      const { data, error } = await supabase
        .from('search_terms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Fetch thumbnails for each search term
      const termsWithImages = await Promise.all(
        (data as SearchTerm[]).map(async (term) => {
          try {
            // For product terms, search for a matching product to get its image
            if (term.type === 'product') {
              const searchResults = await productsIndex.search(term.term, {
                limit: 1,
                attributesToRetrieve: ['image']
              });
              
              if (searchResults.hits.length > 0 && searchResults.hits[0].image) {
                return {
                  ...term,
                  imageUrl: searchResults.hits[0].image as string
                };
              }
            } 
            // For supplier terms, search for products from that supplier to get an image
            else if (term.type === 'supplier') {
              // First get the supplier ID
              const supplierResults = await suppliersIndex.search(term.term, {
                limit: 1,
                attributesToRetrieve: ['Supplier_ID']
              });
              
              if (supplierResults.hits.length > 0 && supplierResults.hits[0].Supplier_ID) {
                // Then search for products from this supplier
                const { data: products } = await supabase
                  .from('Products')
                  .select('Product_Image_URL')
                  .eq('Product_Supplier_ID', supplierResults.hits[0].Supplier_ID)
                  .not('Product_Image_URL', 'is', null)
                  .limit(1);
                
                if (products && products.length > 0 && products[0].Product_Image_URL) {
                  return {
                    ...term,
                    imageUrl: products[0].Product_Image_URL
                  };
                }
              }
            }
            
            // Return the original term if no image was found
            return term;
          } catch (error) {
            console.error(`Error fetching image for search term "${term.term}":`, error);
            return term;
          }
        })
      );
      
      return termsWithImages;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleTermClick = (term: SearchTerm) => {
    analytics.trackEvent('search_term_click', {
      props: { 
        term: term.term,
        type: term.type
      }
    });
    
    const searchParams = new URLSearchParams({
      q: term.term,
      mode: term.type === 'product' ? 'products' : 'suppliers'
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  // Separate terms by type
  const productTerms = searchTerms?.filter(term => term.type === 'product') || [];
  const supplierTerms = searchTerms?.filter(term => term.type === 'supplier') || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error('Error loading search terms:', error);
    return (
      <div className="text-center py-12">
        <p className="text-gray-300">Unable to load search terms. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Popular Searches</h2>
        <p className="text-gray-300">Discover products and suppliers by popular search terms</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Terms Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#F4A024]" />
            <h3 className="text-xl font-semibold text-gray-100">Product Searches</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {productTerms.map((term) => (
              <button
                key={term.id}
                onClick={() => handleTermClick(term)}
                className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors rounded-lg p-4 text-left flex items-center gap-3"
              >
                {term.imageUrl ? (
                  <img 
                    src={term.imageUrl} 
                    alt={term.term}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23F4A024" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700/50 rounded-md flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-[#F4A024]" />
                  </div>
                )}
                <span className="text-gray-100 font-medium">{term.term}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Supplier Terms Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-[#F4A024]" />
            <h3 className="text-xl font-semibold text-gray-100">Supplier searches</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {supplierTerms.map((term) => (
              <button
                key={term.id}
                onClick={() => handleTermClick(term)}
                className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors rounded-lg p-4 text-left flex items-center gap-3"
              >
                {term.imageUrl ? (
                  <img 
                    src={term.imageUrl} 
                    alt={term.term}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23F4A024" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700/50 rounded-md flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#F4A024]" />
                  </div>
                )}
                <span className="text-gray-100 font-medium">{term.term}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}