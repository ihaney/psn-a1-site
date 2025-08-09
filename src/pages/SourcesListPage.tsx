import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';

interface SourceListItem {
  Source_ID: string;
  Source_Title: string;
  Source_Image: string | null;
  Source_About: string | null;
  product_count: number;
  supplier_count: number;
  country_count: number;
}

export default function SourcesListPage() {
  const [sources, setSources] = useState<SourceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSources() {
      try {
        const { data: sourcesData, error: sourcesError } = await supabase
          .from('Sources')
          .select('Source_ID, Source_Title, Source_Image, Source_About');

        if (sourcesError) throw sourcesError;

        const sourcesWithCounts = await Promise.all(
          (sourcesData || []).map(async (source) => {
            // Get product count for this source
            const { count: productCount } = await supabase
              .from('Products')
              .select('*', { count: 'exact', head: true })
              .eq('Product_Source_ID', source.Source_ID);

            // Get ACTUAL supplier count directly from Supplier table (not just suppliers with products)
            const { count: supplierCount } = await supabase
              .from('Supplier')
              .select('*', { count: 'exact', head: true })
              .eq('Supplier_Source_ID', source.Source_ID);
            
            // Get unique countries from products for this source
            const { data: countriesData } = await supabase
              .from('Products')
              .select('Product_Country_ID')
              .eq('Product_Source_ID', source.Source_ID);
            
            const uniqueCountries = new Set(countriesData?.map(p => p.Product_Country_ID));

            return {
              ...source,
              product_count: productCount || 0,
              supplier_count: supplierCount || 0, // This now shows ALL suppliers from this source
              country_count: uniqueCountries.size
            };
          })
        );

        // Sort by product count (highest first)
        const sortedSources = sourcesWithCounts.sort((a, b) => b.product_count - a.product_count);
        setSources(sortedSources);
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, []);

  const handleSourceClick = (sourceId: string) => {
    navigate(`/search?source=${sourceId}`);
  };

  const totalProducts = sources.reduce((sum, source) => sum + source.product_count, 0);
  const totalSuppliers = sources.reduce((sum, source) => sum + source.supplier_count, 0);
  const totalCountries = sources.reduce((sum, source) => sum + source.country_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Product Sources"
        description={`Browse Latin American products from ${sources.length} trusted sources. Access ${totalProducts.toLocaleString()} products from ${totalSuppliers.toLocaleString()} suppliers across ${totalCountries} countries.`}
        keywords={`Latin American marketplaces, ${sources.map(s => s.Source_Title).join(', ')}, B2B sources, wholesale sources`}
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Product Sources" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-tour="sources-list">
            {sources.map((source) => (
              <div
                key={source.Source_ID}
                onClick={() => handleSourceClick(source.Source_ID)}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  {source.Source_Image && (
                    <img
                      src={source.Source_Image}
                      alt={source.Source_Title}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-700/30 p-2"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-100 mb-1">
                      {source.Source_Title}
                    </h2>
                    <div className="text-sm text-[#F4A024] font-medium">
                      {source.product_count.toLocaleString()} products
                    </div>
                  </div>
                </div>

                {source.Source_About && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {source.Source_About}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Products:</span>
                    <span className="text-[#F4A024] font-medium">
                      {source.product_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Suppliers:</span>
                    <span className="text-gray-300 font-medium">
                      {source.supplier_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Countries:</span>
                    <span className="text-gray-300">
                      {source.country_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}