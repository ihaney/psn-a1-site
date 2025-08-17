// src/pages/CountriesListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import WorldMap from '../components/WorldMap'; // <--- Add this import

interface CountryListItem {
  Country_ID: string;
  Country_Title: string;
  Country_Image: string | null;
  product_count: number;
  supplier_count: number;
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
          .select('Country_ID, Country_Title, Country_Image');

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

            return {
              ...country,
              product_count: productCount || 0,
              supplier_count: supplierCount || 0
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

          {/* Add the WorldMap component here */}
          <div className="mb-8"> {/* Add some margin below the map */}
            <WorldMap countryData={countries} /> {/* <--- Pass the countries data */}
          </div>
        </div>
      </div>
    </>
  );
}
