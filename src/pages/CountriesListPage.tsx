import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import WorldMap from '../components/WorldMap';

interface CountryListItem {
  Country_ID: string;
  Country_Title: string;
  Country_Image: string | null;
  product_count: number;
  supplier_count: number;
  sources_count: number;
  latitude?: number;
  longitude?: number;
}

export default function CountriesListPage() {
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCountries() {
      try {
        const { data: countriesData, error: countriesError } = await supabase
          .from('Countries')
          .select('Country_ID, Country_Title, Country_Image, latitude, longitude');

        if (countriesError) throw countriesError;

        const countriesWithCounts = await Promise.all(
          (countriesData || []).map(async (country) => {
            const [{ count: productCount }, { count: supplierCount }] = await Promise.all([
              supabase
                .from('Products')
                .select('*', { count: 'exact', head: true })
                .eq('Product_Country_ID', country.Country_ID),
              supabase
                .from('Supplier')
                .select('*', { count: 'exact', head: true })
                .eq('Supplier_Country_ID', country.Country_ID)
            ]);

            // Get unique sources count for this country
            const { data: sourcesData } = await supabase
              .from('Products')
              .select('Product_Source_ID')
              .eq('Product_Country_ID', country.Country_ID);
            
            const uniqueSources = new Set(sourcesData?.map(p => p.Product_Source_ID).filter(Boolean));

            return {
              ...country,
              product_count: productCount || 0,
              supplier_count: supplierCount || 0,
              sources_count: uniqueSources.size,
              latitude: country.latitude,
              longitude: country.longitude
            };
          })
        );

        setCountries(countriesWithCounts);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  const handleCountryClick = (countryId: string) => {
    navigate(`/search?country=${countryId}`);
  };

  const totalProducts = countries.reduce((sum, country) => sum + country.product_count, 0);
  const totalSuppliers = countries.reduce((sum, country) => sum + country.supplier_count, 0);

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
        title="Latin American Countries"
        description={`Explore products and suppliers from ${countries.length} Latin American countries. Browse ${totalProducts.toLocaleString()} products from ${totalSuppliers.toLocaleString()} verified suppliers.`}
        keywords={`Latin American countries, ${countries.map(c => c.Country_Title).join(', ')}, international trade, B2B marketplace`}
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Countries" />

          <div className="mb-8">
            <WorldMap countryData={countries} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-tour="countries-list">
            {countries.map((country) => (
              <div
                key={country.Country_ID}
                onClick={() => handleCountryClick(country.Country_ID)}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  {country.Country_Image && (
                    <img
                      src={country.Country_Image}
                      alt={country.Country_Title}
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-gray-100">
                    {country.Country_Title}
                  </h2>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">
                    {country.product_count} {country.product_count === 1 ? 'product' : 'products'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {country.supplier_count} {country.supplier_count === 1 ? 'supplier' : 'suppliers'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {country.sources_count} {country.sources_count === 1 ? 'source' : 'sources'}
                  </p>
                  {country.latitude && country.longitude && (
                    <p className="text-xs text-[#F4A024]">
                      📍 Pinpointed on map
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}