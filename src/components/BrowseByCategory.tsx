import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { 
  Factory, 
  Zap, 
  Shirt, 
  Package, 
  Hammer, 
  Utensils, 
  Leaf, 
  Truck,
  Palette,
  Sofa,
  Smartphone,
  Briefcase,
  Wrench,
  Scissors,
  Wine,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import LoadingSpinner from './LoadingSpinner';

interface Category {
  Category_ID: string;
  Category_Name: string;
  product_count: number;
}

interface CategoryWithIcon extends Category {
  icon: React.ReactNode;
}

export default function BrowseByCategory() {
  const navigate = useNavigate();
  
  // Fetch categories with product counts
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categoriesWithCounts'],
    queryFn: async () => {
      // First get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('Categories')
        .select('Category_ID, Category_Name')
        .order('Category_Name');

      if (categoriesError) throw categoriesError;
      
      // For each category, get the product count
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('Products')
            .select('*', { count: 'exact', head: true })
            .eq('Product_Category_ID', category.Category_ID);
            
          if (countError) {
            console.error(`Error getting count for category ${category.Category_Name}:`, countError);
            return {
              ...category,
              product_count: 0
            };
          }
          
          return {
            ...category,
            product_count: count || 0
          };
        })
      );
      
      // Sort by product count (descending)
      return categoriesWithCounts.sort((a, b) => b.product_count - a.product_count);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Map categories to icons based on their names
  const getCategoryWithIcon = (category: Category): CategoryWithIcon => {
    const name = category.Category_Name.toLowerCase();
    let icon;

    if (name.includes('industrial') || name.includes('machinery') || name.includes('equipment')) {
      icon = <Factory className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('electronic') || name.includes('electric')) {
      icon = <Zap className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('apparel') || name.includes('clothing') || name.includes('textile')) {
      icon = <Shirt className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('packaging') || name.includes('logistics')) {
      icon = <Package className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('construction') || name.includes('building')) {
      icon = <Hammer className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('food') || name.includes('beverage')) {
      icon = <Utensils className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('agriculture') || name.includes('farm')) {
      icon = <Leaf className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('automotive') || name.includes('vehicle')) {
      icon = <Truck className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('art') || name.includes('craft')) {
      icon = <Palette className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('furniture') || name.includes('home')) {
      icon = <Sofa className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('phone') || name.includes('mobile')) {
      icon = <Smartphone className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('business') || name.includes('office')) {
      icon = <Briefcase className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('tool')) {
      icon = <Wrench className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('beauty') || name.includes('cosmetic')) {
      icon = <Scissors className="w-12 h-12 text-[#F4A024]" />;
    } else if (name.includes('wine') || name.includes('alcohol')) {
      icon = <Wine className="w-12 h-12 text-[#F4A024]" />;
    } else {
      // Default icon
      icon = <ShoppingBag className="w-12 h-12 text-[#F4A024]" />;
    }

    return {
      ...category,
      icon
    };
  };

  const handleCategoryClick = (category: Category) => {
    // Track analytics
    analytics.trackEvent('category_click', {
      props: { 
        category_id: category.Category_ID,
        category_name: category.Category_Name
      }
    });
    
    navigate(`/search?category=${category.Category_ID}`);
  };

  const handleCategoryHover = (category: Category) => {
    // Prefetch category products when hovering
    queryClient.prefetchQuery({
      queryKey: ['searchResults', { category: category.Category_ID }],
      queryFn: async () => {
        // Fetch products for this category
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
            Product_Source_Name
          `)
          .eq('Product_Category_ID', category.Category_ID)
          .limit(20);
        if (error) throw error;
        return data;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error('Error loading categories:', error);
    return null;
  }

  // Get top 8 categories with highest product count
  const topCategories = categories?.slice(0, 8) || [];
  
  // Map categories to include icons
  const categoriesWithIcons = topCategories.map(getCategoryWithIcon);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Browse by Category</h2>
        <p className="text-gray-300">Explore our most popular product categories</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categoriesWithIcons.map((category) => (
          <div
            key={category.Category_ID}
            onMouseEnter={() => handleCategoryHover(category)}
            onClick={() => handleCategoryClick(category)}
            className="relative overflow-hidden rounded-lg aspect-square cursor-pointer group bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="mb-4 bg-[#F4A024]/10 p-4 rounded-full">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{category.Category_Name}</h3>
              <p className="text-sm text-gray-300 mt-1">{category.product_count} products</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}