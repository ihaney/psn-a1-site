import { useQuery } from '@tanstack/react-query';
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

export function useSuppliers(page: number = 0, pageSize: number = 100) {
  return useQuery({
    queryKey: ['suppliers', page, pageSize],
    queryFn: async () => {
      console.log('🚀 useSuppliers queryFn STARTED');
      console.log('📋 Query parameters:', { page, pageSize });
      
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        console.log(`🔍 Fetching suppliers page ${page + 1} (${pageSize} per page) - range ${from}-${to}`);

        // First, let's test if we can access the Supplier table at all
        console.log('🧪 Testing basic access to Supplier table...');
        const { count: testCount, error: testError } = await supabase
          .from('Supplier')
          .select('*', { count: 'exact', head: true });

        console.log('🧪 Test result:', { testCount, testError });

        if (testError) {
          console.error('❌ Cannot access Supplier table:', testError);
          // Try alternative approach - check if there's an RPC function we should use
          console.log('🔄 Trying RPC function approach...');
          
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('get_suppliers_with_product_count', {
                limit_count: pageSize,
                offset_count: from
              });

            if (rpcError) {
              console.error('❌ RPC function also failed:', rpcError);
              throw new Error(`Both direct table access and RPC failed. Direct: ${testError.message}, RPC: ${rpcError.message}`);
            }

            console.log('✅ RPC function worked! Data:', rpcData?.slice(0, 3));
            
            // Get total count via RPC
            const { data: countData, error: countError } = await supabase
              .rpc('get_suppliers_with_product_count', {
                limit_count: 999999,
                offset_count: 0
              });

            const totalCount = countData?.length || 0;
            console.log(`📈 Total supplier count via RPC: ${totalCount}`);

            const suppliers: SupplierListItem[] = (rpcData || []).map((supplier: any) => ({
              Supplier_ID: supplier.supplier_id || supplier.Supplier_ID,
              Supplier_Title: supplier.supplier_title || supplier.Supplier_Title || 'Unknown Supplier',
              Supplier_Description: supplier.supplier_description || supplier.Supplier_Description || '',
              Supplier_Website: supplier.supplier_website || supplier.Supplier_Website || '',
              Supplier_Email: supplier.supplier_email || supplier.Supplier_Email || '',
              Supplier_Location: supplier.supplier_location || supplier.Supplier_Location || '',
              Supplier_Whatsapp: supplier.supplier_whatsapp || supplier.Supplier_Whatsapp || '',
              Supplier_Country_Name: supplier.supplier_country_name || supplier.Supplier_Country_Name || 'Unknown',
              Supplier_City_Name: supplier.supplier_city_name || supplier.Supplier_City_Name || '',
              Supplier_Source_ID: supplier.supplier_source_id || supplier.Supplier_Source_ID || ''
            }));

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages - 1;
            const hasPrevPage = page > 0;

            console.log(`✅ RPC Result - Page ${page + 1}/${totalPages}: Got ${suppliers.length} suppliers`);

            return {
              data: suppliers,
              totalCount,
              currentPage: page,
              totalPages,
              hasNextPage,
              hasPrevPage,
              pageSize
            };

          } catch (rpcError) {
            console.error('❌ RPC approach also failed:', rpcError);
            throw testError; // Throw the original error
          }
        }

        // If direct access works, proceed with normal query
        const { data: suppliersData, error: suppliersError, count: totalCount } = await supabase
          .from('Supplier')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('Supplier_Title', { ascending: true });

        if (suppliersError) {
          console.error('❌ Error fetching suppliers:', suppliersError);
          throw suppliersError;
        }

        console.log(`📦 Raw suppliers data (${suppliersData?.length || 0} items):`, suppliersData?.slice(0, 3));
        console.log(`📈 Total supplier count: ${totalCount}`);

        if (!suppliersData || suppliersData.length === 0) {
          console.log('⚠️ No suppliers data returned from query');
          return {
            data: [],
            totalCount: totalCount || 0,
            currentPage: page,
            totalPages: Math.ceil((totalCount || 0) / pageSize),
            hasNextPage: false,
            hasPrevPage: false,
            pageSize
          };
        }

        // Transform the data to match our interface
        const suppliers: SupplierListItem[] = suppliersData.map(supplier => ({
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

        const totalPages = Math.ceil((totalCount || 0) / pageSize);
        const hasNextPage = page < totalPages - 1;
        const hasPrevPage = page > 0;

        console.log(`✅ Final result - Page ${page + 1}/${totalPages}: Got ${suppliers.length} suppliers`);
        console.log(`📊 Pagination: ${(page * pageSize) + 1}-${Math.min((page + 1) * pageSize, totalCount || 0)} of ${totalCount || 0} total`);
        console.log(`🎯 First supplier sample:`, suppliers[0]);

        return {
          data: suppliers,
          totalCount: totalCount || 0,
          currentPage: page,
          totalPages,
          hasNextPage,
          hasPrevPage,
          pageSize
        };
      } catch (error) {
        console.error('💥 useSuppliers error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}