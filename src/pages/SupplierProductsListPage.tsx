import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { getSupplierIdFromParams } from '../utils/urlHelpers';
import type { Product } from '../types';

const PRODUCTS_PER_PAGE = 24;

export default function SupplierProductsListPage() {
  const params = useParams();
  const navigate = useNavigate();
  const supplierId = getSupplierIdFromParams(params);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch supplier name for page title
  const { data: supplier } = useQuery({
    queryKey: ['supplierName', supplierId],
    queryFn: async () => {
      if (!supplierId) return null;
      
      const { data, error } = await supabase
        .from('Supplier')
        .select('Supplier_Title, Supplier_Country_Name')
        .eq('Supplier_ID', supplierId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  // Fetch paginated products for this supplier
  const { 
    data: productsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['supplierAllProducts', supplierId, currentPage],
    queryFn: async () => {
      if (!supplierId) return { products: [], totalCount: 0 };
      
      const from = currentPage * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;

      // Get products with count for pagination
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
        .eq('Product_Supplier_ID', supplierId)
        .range(from, to)
        .order('Product_Title');

      if (error) throw error;
      
      // Transform to match Product interface
      const products = (data || []).map(product => ({
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

      return {
        products,
        totalCount: count || 0
      };
    },
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

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

  const handleBackToSupplier = () => {
    navigate(`/supplier/${params.slug}/${supplierId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <>
        <SEO 
          title="Supplier Products Not Found"
          description="The requested supplier products could not be found."
        />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Error Loading Products</h1>
            <p className="text-gray-300">Please try refreshing the page.</p>
          </div>
        </div>
      </>
    );
  }

  const pageTitle = `All Products from ${supplier.Supplier_Title}`;

  return (
    <>
      <SEO 
        title={pageTitle}
        description={`Browse all products from ${supplier.Supplier_Title}, a trusted supplier from ${supplier.Supplier_Country_Name}. View ${totalCount} wholesale products.`}
        keywords={`${supplier.Supplier_Title}, ${supplier.Supplier_Country_Name}, supplier products, wholesale, B2B`}
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBackToSupplier}
            className="inline-flex items-center text-[#F4A024] hover:text-[#F4A024]/80 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {supplier.Supplier_Title}
          </button>

          <Breadcrumbs currentPageTitle={pageTitle} />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-100 mb-2">
                  All Products from {supplier.Supplier_Title}
                </h1>
                <p className="text-gray-400">
                  Showing {products.length} of {totalCount.toLocaleString()} products
                  {currentPage > 0 && ` (Page ${currentPage + 1} of ${totalPages})`}
                </p>
              </div>
            </div>
            
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
                <p className="text-gray-400">No products found for this supplier.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}