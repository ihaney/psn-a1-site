import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Supplier {
  Supplier_ID: string;
  Supplier_Title: string;
}

export function useSupplierSearch(query: string) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function searchSuppliers() {
      if (!query.trim()) {
        setSuppliers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('Supplier')
          .select('Supplier_ID, Supplier_Title')
          .ilike('Supplier_Title', `%${query}%`)
          .limit(5);

        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error searching suppliers:', error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(searchSuppliers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { suppliers, loading };
}