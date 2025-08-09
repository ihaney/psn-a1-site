import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { queryClient } from '../lib/queryClient';
import { Product } from '../types';
import { analytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { useSavedItems } from '../hooks/useSavedItems';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { data: savedItems = [], toggleSavedItem } = useSavedItems();
  const [imageError, setImageError] = useState(false);
  const isSaved = savedItems.some(item => item.id === product.id);

  const handleMouseEnter = () => {
    // Prefetch product details when hovering over the card
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: async () => {
        const { data, error } = await supabase
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
            Product_Source_Name,
            Product_Supplier_ID
          `)
          .eq('Product_ID', product.id)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Also prefetch supplier contact info if available
    if (product.supplier) {
      queryClient.prefetchQuery({
        queryKey: ['supplierContact', product.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('Supplier')
            .select('Supplier_Email, Supplier_Whatsapp')
            .eq('Supplier_Title', product.supplier)
            .maybeSingle();

          if (error) throw error;
          return data;
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
      });
    }
  };

  const handleClick = async () => {
    // Track analytics
    analytics.trackEvent('product_click', {
      props: {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        product_country: product.country,
        product_supplier: product.supplier,
        product_source: product.marketplace,
        product_price: product.Product_Price
      }
    });

    // Record view
    try {
      await supabase.rpc('record_product_view', {
        product_id: product.id
      });
    } catch (error) {
      console.error('Error recording product view:', error);
    }

    navigate(`/product/${product.id}`);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to save items');
        return;
      }
      
      await toggleSavedItem(product);
      toast.success(isSaved ? 'Item removed from saved items' : 'Item saved successfully');
      
      analytics.trackEvent(isSaved ? 'item_unsaved' : 'item_saved', {
        props: {
          product_id: product.id,
          product_name: product.name
        }
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group relative">
      <div
        onMouseEnter={handleMouseEnter}
        className="cursor-pointer"
        onClick={handleClick}
      >
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
              onError={handleImageError}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center p-4 group-hover:opacity-75 transition-opacity">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No image available</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col min-h-[6rem]">
          <h3 className="text-sm text-gray-100 mb-2 line-clamp-2">{product.name}</h3>
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-[#F4A024]">{product.Product_Price}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300 inline-block text-center">
                {product.category}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300 inline-block text-center">
                {product.marketplace} • {product.country}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSaveClick}
        className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
          isSaved 
            ? 'bg-gray-800/80 text-[#F4A024]' 
            : 'bg-gray-800/80 text-gray-300 hover:text-[#F4A024]'
        }`}
      >
        <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
        <span className="sr-only">{isSaved ? 'Remove from saved' : 'Save item'}</span>
      </button>
    </div>
  );
}