import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import { Building2, Users, Globe2, Database, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [metrics, setMetrics] = useState({
    suppliers: 0,
    products: 0,
    sources: 0
  });

  // Function to format numbers to nearest 500 with K suffix
  const formatMetricNumber = (num: number): string => {
    if (num < 1000) {
      return num.toString();
    }
    
    // Round to nearest 500
    const rounded = Math.round(num / 500) * 500;
    
    if (rounded >= 1000) {
      const kValue = rounded / 1000;
      // If it's a whole number, show without decimal
      if (kValue % 1 === 0) {
        return `${kValue}K`;
      } else {
        // Show one decimal place
        return `${kValue.toFixed(1)}K`;
      }
    }
    
    return rounded.toString();
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching metrics...');
        
        const [suppliersCount, productsCount, sourcesCount] = await Promise.all([
          supabase.from('Supplier').select('*', { count: 'estimated', head: true }),
          supabase.from('Products').select('*', { count: 'estimated', head: true }),
          supabase.from('Sources').select('*', { count: 'estimated', head: true })
        ]);

        console.log('Metrics results:', { suppliersCount, productsCount, sourcesCount });

        setMetrics({
          suppliers: suppliersCount.count || 0,
          products: productsCount.count || 0,
          sources: sourcesCount.count || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }

    fetchData();
  }, []);

  // Debug logging
  console.log('HomePage render:', { 
    metrics 
  });

  return (
    <>
      <SEO 
        title="Latin American Products Marketplace"
        description="Discover authentic Latin American products and connect with trusted suppliers. Find wholesale products from Mexico, Colombia, Brazil and more."
        keywords="Latin American marketplace, wholesale products, B2B marketplace, Mexican products, Colombian products, Brazilian products"
      />
      <Hero />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Platform Description and Metrics Section */}
          <div className="py-16 border-t border-gray-800">
            <div className="text-center mb-12">
              <h2 className="text-6xl font-bold paisan-text text-[#F4A024] mb-4">
                Paisán
              </h2>
              <p className="text-2xl text-gray-300 mb-8">
                A Trusted Sourcing Tool
              </p>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Simplifying sourcing across Latin America by providing comprehensive supplier and product data.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4">
                  <Building2 className="w-6 h-6 text-[#F4A024]" />
                </div>
                <div className="text-3xl font-bold text-[#F4A024] mb-2">
                  {formatMetricNumber(metrics.suppliers)}+
                </div>
                <div className="text-gray-400">Suppliers</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-[#F4A024]" />
                </div>
                <div className="text-3xl font-bold text-[#F4A024] mb-2">
                  {formatMetricNumber(metrics.products)}+
                </div>
                <div className="text-gray-400">Products</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4">
                  <Database className="w-6 h-6 text-[#F4A024]" />
                </div>
                <div className="text-3xl font-bold text-[#F4A024] mb-2">
                  {formatMetricNumber(metrics.sources)}+
                </div>
                <div className="text-gray-400">Sources</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-4">
                  <UserCheck className="w-6 h-6 text-[#F4A024]" />
                </div>
                <div className="text-3xl font-bold text-[#F4A024] mb-2">5M+</div>
                <div className="text-gray-400">Monthly Audience</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}