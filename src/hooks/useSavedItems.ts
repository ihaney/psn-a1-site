import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

export function useSavedItems() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['savedItems'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data: savedItems, error } = await supabase
        .from('saved_items')
        .select(`
          product_id,
          Products (
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
          )
        `)
        .eq('user_id', session.user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return savedItems.map(item => ({
        id: item.Products.Product_ID,
        name: item.Products.Product_Title,
        Product_Price: item.Products.Product_Price || '$0',
        image: item.Products.Product_Image_URL || '',
        country: item.Products.Product_Country_Name || 'Unknown',
        category: item.Products.Product_Category_Name || 'Unknown',
        supplier: item.Products.Product_Supplier_Name || 'Unknown',
        Product_MOQ: item.Products.Product_MOQ || '0',
        sourceUrl: item.Products.Product_URL || '',
        marketplace: item.Products.Product_Source_Name || 'Unknown'
      }));
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const toggleSavedItem = async (product: Product) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Must be logged in to save items');

    // Optimistically update the cache
    const previousData = queryClient.getQueryData<Product[]>(['savedItems']) || [];
    const isCurrentlySaved = previousData.some(item => item.id === product.id);

    queryClient.setQueryData(['savedItems'], isCurrentlySaved
      ? previousData.filter(item => item.id !== product.id)
      : [...previousData, product]
    );

    try {
      if (isCurrentlySaved) {
        await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', product.id);
      } else {
        await supabase
          .from('saved_items')
          .insert({
            user_id: session.user.id,
            product_id: product.id
          });
      }
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(['savedItems'], previousData);
      throw error;
    }
  };

  return {
    ...query,
    toggleSavedItem
  };
}