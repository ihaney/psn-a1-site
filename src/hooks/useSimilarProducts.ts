import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

export function useSimilarProducts(productId: string) {
  return useQuery({
    queryKey: ['similarProducts', productId],
    queryFn: async () => {
      // For now, let's get similar products based on category
      // First get the current product's category
      const { data: currentProduct, error: productError } = await supabase
        .from('Products')
        .select('Product_Category_Name')
        .eq('Product_ID', productId)
        .single();

      if (productError) throw productError;

      // Then get other products in the same category
      const { data: similarProducts, error: similarError } = await supabase
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
        `)
        .eq('Product_Category_Name', currentProduct.Product_Category_Name)
        .neq('Product_ID', productId)
        .limit(4);

      if (similarError) throw similarError;

      return similarProducts.map(product => ({
        id: product.Product_ID,
        name: product.Product_Title,
        Product_Price: product.Product_Price || '$0',
        image: product.Product_Image_URL || '',
        country: product.Product_Country_Name || 'Unknown',
        category: product.Product_Category_Name || 'Unknown',
        supplier: product.Product_Supplier_Name || 'Unknown',
        Product_MOQ: product.Product_MOQ || '0',
        sourceUrl: product.Product_URL || '',
        marketplace: product.Product_Source_Name || 'Unknown'
      }));
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  });
}