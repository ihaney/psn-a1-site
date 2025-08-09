import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

const PRODUCTS_PER_PAGE = 100;

export function useProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;

      try {
        console.log(`Fetching products page ${pageParam + 1} (items ${from + 1}-${to + 1})`);
        
        // Get products with count for pagination
        const { data, error, count } = await supabase
          .from('Products')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('Product_ID');

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Ensure data is always an array
        const safeData = Array.isArray(data) ? data : [];
        console.log(`Fetched ${safeData.length} products for page ${pageParam + 1}`);

        const products = safeData.map(product => ({
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
        }));

        // Calculate if there's a next page
        const totalItems = count || 0;
        const currentItemsLoaded = (pageParam + 1) * PRODUCTS_PER_PAGE;
        const hasMore = currentItemsLoaded < totalItems;

        console.log(`Page ${pageParam + 1}: ${products.length} items, ${currentItemsLoaded}/${totalItems} total loaded, hasMore: ${hasMore}`);

        return {
          data: products,
          nextPage: hasMore ? pageParam + 1 : undefined,
          totalCount: totalItems,
          hasMore
        };
      } catch (error) {
        console.error('Query function error:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}