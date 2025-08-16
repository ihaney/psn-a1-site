import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SavedSupplierItem } from '../types';

export function useSavedSuppliers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['savedSuppliers'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      // Get member ID first
      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', session.user.id)
        .single();

      if (!memberData) return [];

      const { data: savedSuppliers, error } = await supabase
        .from('member_saved_suppliers')
        .select(`
          supplier_id,
          Supplier (
            Supplier_ID,
            Supplier_Title,
            Supplier_Description,
            Supplier_Website,
            Supplier_Email,
            Supplier_Location,
            Supplier_Whatsapp,
            Supplier_Country_Name,
            Supplier_City_Name,
            Supplier_Source_ID
          )
        `)
        .eq('member_id', memberData.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return savedSuppliers.map(item => ({
        id: item.Supplier.Supplier_ID,
        name: item.Supplier.Supplier_Title || 'Unknown Supplier',
        description: item.Supplier.Supplier_Description || '',
        website: item.Supplier.Supplier_Website || '',
        email: item.Supplier.Supplier_Email || '',
        location: item.Supplier.Supplier_Location || '',
        whatsapp: item.Supplier.Supplier_Whatsapp || '',
        country: item.Supplier.Supplier_Country_Name || 'Unknown',
        city: item.Supplier.Supplier_City_Name || '',
        sourceId: item.Supplier.Supplier_Source_ID || ''
      }));
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const toggleSavedSupplier = async (supplier: SavedSupplierItem) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Must be logged in to save suppliers');

    // Get member ID
    const { data: memberData } = await supabase
      .from('members')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();

    if (!memberData) throw new Error('Member profile not found');

    // Optimistically update the cache
    const previousData = queryClient.getQueryData<SavedSupplierItem[]>(['savedSuppliers']) || [];
    const isCurrentlySaved = previousData.some(item => item.id === supplier.id);

    queryClient.setQueryData(['savedSuppliers'], isCurrentlySaved
      ? previousData.filter(item => item.id !== supplier.id)
      : [...previousData, supplier]
    );

    try {
      if (isCurrentlySaved) {
        await supabase
          .from('member_saved_suppliers')
          .delete()
          .eq('member_id', memberData.id)
          .eq('supplier_id', supplier.id);
      } else {
        await supabase
          .from('member_saved_suppliers')
          .insert({
            member_id: memberData.id,
            supplier_id: supplier.id
          });
      }
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(['savedSuppliers'], previousData);
      throw error;
    }
  };

  return {
    ...query,
    toggleSavedSupplier
  };
}