import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

interface ContactHistoryItem {
  id: string;
  product: Product;
  contactMethod: 'email' | 'whatsapp';
  contactedAt: string;
}

export function useContactHistory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['contactHistory'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', session.user.id)
        .single();

      if (!memberData) return [];

      const { data, error } = await supabase
        .from('member_messages')
        .select(`
          id,
          contact_method,
          contacted_at,
          Products (
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Countries (Country_Title),
            Categories (Category_Name),
            Supplier (Supplier_Title),
            Sources (Source_Title)
          )
        `)
        .eq('member_id', memberData.id)
        .order('contacted_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        contactMethod: item.contact_method,
        contactedAt: item.contacted_at,
        product: {
          id: item.Products.Product_ID,
          name: item.Products.Product_Title,
          Product_Price: item.Products.Product_Price,
          image: item.Products.Product_Image_URL || '',
          country: item.Products.Countries?.Country_Title || 'Unknown',
          category: item.Products.Categories?.Category_Name || 'Unknown',
          supplier: item.Products.Supplier?.Supplier_Title || 'Unknown',
          Product_MOQ: item.Products.Product_MOQ,
          sourceUrl: item.Products.Product_URL || '',
          marketplace: item.Products.Sources?.Source_Title || 'Unknown'
        }
      }));
    }
  });

  const recordContact = async (productId: string, contactMethod: 'email' | 'whatsapp') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Must be logged in to contact suppliers');

    const { data: memberData } = await supabase
      .from('members')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();

    if (!memberData) throw new Error('Member profile not found');

    const { data: productData } = await supabase
      .from('Products')
      .select('Product_Supplier_ID')
      .eq('Product_ID', productId)
      .single();

    if (!productData) throw new Error('Product not found');

    const { error } = await supabase
      .from('member_messages')
      .insert({
        member_id: memberData.id,
        product_id: productId,
        supplier_id: productData.Product_Supplier_ID,
        contact_method: contactMethod
      });

    if (error) throw error;

    // Invalidate the query to trigger a refetch
    queryClient.invalidateQueries(['contactHistory']);
  };

  return {
    ...query,
    recordContact
  };
}