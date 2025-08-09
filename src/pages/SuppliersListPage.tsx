import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, Building2, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import { createSupplierUrl } from '../utils/urlHelpers';
import { supabase } from '../lib/supabase';

interface SupplierListItem {
  Supplier_ID: string;
  Supplier_Title: string;
  Supplier_Description: string;
  Supplier_Website: string;
  Supplier_Email: string;
  Supplier_Location: string;
  Supplier_Whatsapp: string;
  Supplier_Country_Name: string;
  Supplier_City_Name: string;
  Supplier_Source_ID: string;
}

const SUPPLIERS_PER_PAGE = 50;

export default function SuppliersListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  
  // Use the same direct query approach that works elsewhere in the app
  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliersList', currentPage],
    queryFn: async () => {
      const from = currentPage * SUPPLIERS_PER_PAGE;
      const to = from + SUPPLIERS_PER_PAGE - 1;

      // Get suppliers with count for pagination - using the same pattern as other pages
      const { data: suppliersData, error: suppliersError, count } = await supabase
        .from('Supplier')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('Supplier_Title', { ascending: true });

      if (suppliersError) {
        console.error('Error fetching suppliers:', suppliersError);
        throw suppliersError;
      }

      const suppliers: SupplierListItem[] = (suppliersData || []).map(supplier => ({
        Supplier_ID: supplier.Supplier_ID,
        Supplier_Title: supplier.Supplier_Title || 'Unknown Supplier',
        Supplier_Description: supplier.Supplier_Description || '',
        Supplier_Website: supplier.Supplier_Website || '',
        Supplier_Email: supplier.Supplier_Email || '',
        Supplier_Location: supplier.Supplier_Location || '',
        Supplier_Whatsapp: supplier.Supplier_Whatsapp || '',
        Supplier_Country_Name: supplier.Supplier_Country_Name || 'Unknown',
        Supplier_City_Name: supplier.Supplier_City_Name || '',
        Supplier_Source_ID: supplier.Supplier_Source_ID || ''
      }));

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / SUPPLIERS_PER_PAGE);
      const hasNextPage = currentPage < totalPages - 1;
      const hasPrevPage = currentPage > 0;

      return {
        data: suppliers,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const suppliers = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const hasNextPage = data?.hasNextPage || false;
  const hasPrevPage = data?.hasPrevPage || false;

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

  const handleSupplierClick = (supplier: SupplierListItem) => {
    navigate(createSupplierUrl(supplier.Supplier_Title, supplier.Supplier_ID));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <SEO 
          title="Error Loading Suppliers"
          description="Unable to load suppliers directory. Please try again later."
        />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Error Loading Suppliers</h1>
            <p className="text-gray-300">Please try refreshing the page.</p>
            <p className="text-sm text-gray-400 mt-2">{error.message}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Suppliers Directory"
        description={`Browse ${totalCount.toLocaleString()} verified Latin American suppliers. Find trusted wholesale suppliers across Latin America.`}
        keywords="Latin American suppliers, wholesale suppliers, B2B suppliers, verified suppliers"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Suppliers Directory" />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <p className="text-gray-400">
                  Showing {suppliers.length} of {totalCount.toLocaleString()} suppliers
                  {currentPage > 0 && ` (Page ${currentPage + 1} of ${totalPages})`}
                </p>
              </div>
            </div>
            
            {suppliers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6" data-tour="suppliers-list">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.Supplier_ID}
                      onClick={() => handleSupplierClick(supplier)}
                      className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-[#F4A024]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F4A024]/20 transition-colors">
                            <Building2 className="w-6 h-6 text-[#F4A024]" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-[#F4A024] transition-colors">
                            {supplier.Supplier_Title}
                          </h3>
                          
                          {supplier.Supplier_Description && (
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                              {supplier.Supplier_Description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                            {(supplier.Supplier_Country_Name || supplier.Supplier_Location) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {supplier.Supplier_Location || 
                                   `${supplier.Supplier_City_Name ? supplier.Supplier_City_Name + ', ' : ''}${supplier.Supplier_Country_Name}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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
                <p className="text-gray-400">No suppliers found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}