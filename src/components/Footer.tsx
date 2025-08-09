import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [categories, setCategories] = useState<{ Category_ID: string; Category_Name: string; }[]>([]);
  const [sources, setSources] = useState<{ Source_ID: string; Source_Title: string; }[]>([]);
  const [countries, setCountries] = useState<{ Country_ID: string; Country_Title: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch data with graceful error handling
        const results = await Promise.allSettled([
          supabase.from('Categories').select('Category_ID, Category_Name').order('Category_Name').limit(10),
          supabase.from('Sources').select('Source_ID, Source_Title').order('Source_Title').limit(10),
          supabase.from('Countries').select('Country_ID, Country_Title').order('Country_Title').limit(10)
        ]);

        // Process results individually - don't fail if one fails
        const [categoriesResult, sourcesResult, countriesResult] = results;

        if (categoriesResult.status === 'fulfilled' && categoriesResult.value.data) {
          setCategories(categoriesResult.value.data);
        } else {
          console.warn('Categories fetch failed, using empty array');
          setCategories([]);
        }

        if (sourcesResult.status === 'fulfilled' && sourcesResult.value.data) {
          setSources(sourcesResult.value.data);
        } else {
          console.warn('Sources fetch failed, using empty array');
          setSources([]);
        }

        if (countriesResult.status === 'fulfilled' && countriesResult.value.data) {
          setCountries(countriesResult.value.data);
        } else {
          console.warn('Countries fetch failed, using empty array');
          setCountries([]);
        }

      } catch (err) {
        console.warn('Footer data fetch error (non-critical):', err);
        
        // Always set fallback data to prevent footer from breaking
        setCategories([]);
        setSources([]);
        setCountries([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 py-16 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Categories</h3>
            {categories.length > 0 ? (
              <ul className="space-y-3">
                {categories.map(category => (
                  <li key={category.Category_ID}>
                    <Link
                      to={`/search?category=${category.Category_ID}`}
                      className="text-gray-400 hover:text-[#F4A024] transition-colors"
                      onClick={handleLinkClick}
                    >
                      {category.Category_Name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Browse categories</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Sources</h3>
            {sources.length > 0 ? (
              <ul className="space-y-3">
                {sources.map(source => (
                  <li key={source.Source_ID}>
                    <Link
                      to={`/search?source=${source.Source_ID}`}
                      className="text-gray-400 hover:text-[#F4A024] transition-colors"
                      onClick={handleLinkClick}
                    >
                      {source.Source_Title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Browse sources</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Countries</h3>
            {countries.length > 0 ? (
              <ul className="space-y-3">
                {countries.map(country => (
                  <li key={country.Country_ID}>
                    <Link
                      to={`/search?country=${country.Country_ID}`}
                      className="text-gray-400 hover:text-[#F4A024] transition-colors"
                      onClick={handleLinkClick}
                    >
                      {country.Country_Title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Browse countries</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}