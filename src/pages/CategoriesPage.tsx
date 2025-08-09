import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';

interface Category {
  Category_ID: string;
  Category_Name: string;
  product_count: number;
  supplier_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('Fetching categories...');
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('Categories')
          .select('*');

        if (categoriesError) {
          console.error('Categories error:', categoriesError);
          throw categoriesError;
        }

        console.log('Categories data:', categoriesData);

        if (!categoriesData || categoriesData.length === 0) {
          setCategories([]);
          setError('No categories found in the database');
          return;
        }

        // Fetch all products in a single query for efficient counting
        console.log('Fetching all products for count aggregation...');
        const { data: allProducts, error: productsError } = await supabase
          .from('Products')
          .select('Product_ID, Product_Category_ID, Product_Supplier_ID');

        if (productsError) {
          console.error('Products error:', productsError);
          throw productsError;
        }

        console.log('All products data:', allProducts?.length || 0, 'products');

        // Create maps to count products and suppliers per category
        const categoryProductCounts = new Map<string, number>();
        const categorySupplierSets = new Map<string, Set<string>>();

        // Initialize maps for all categories
        categoriesData.forEach(category => {
          categoryProductCounts.set(category.Category_ID, 0);
          categorySupplierSets.set(category.Category_ID, new Set());
        });

        // Count products and collect unique suppliers per category
        if (allProducts) {
          allProducts.forEach(product => {
            const categoryId = product.Product_Category_ID;
            const supplierId = product.Product_Supplier_ID;

            if (categoryId) {
              // Increment product count
              const currentCount = categoryProductCounts.get(categoryId) || 0;
              categoryProductCounts.set(categoryId, currentCount + 1);

              // Add supplier to set (automatically handles uniqueness)
              if (supplierId) {
                const supplierSet = categorySupplierSets.get(categoryId);
                if (supplierSet) {
                  supplierSet.add(supplierId);
                }
              }
            }
          });
        }

        // Build final categories with counts
        const categoriesWithCounts = categoriesData.map(category => ({
          Category_ID: category.Category_ID,
          Category_Name: category.Category_Name,
          product_count: categoryProductCounts.get(category.Category_ID) || 0,
          supplier_count: categorySupplierSets.get(category.Category_ID)?.size || 0
        }));

        console.log('Categories with counts:', categoriesWithCounts.slice(0, 3));

        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error Loading Categories</h1>
          <p className="text-gray-300">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Check the browser console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Product Categories"
        description="Browse our Latin American product categories. Find wholesale products across various industries and categories."
        keywords="Latin American categories, product categories, wholesale categories, B2B categories"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Product Categories" />
          
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300">No categories found.</p>
              <p className="text-sm text-gray-400 mt-2">This might be a database connection issue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="categories-grid">
              {categories.map((category) => (
                <button
                  key={category.Category_ID}
                  onClick={() => handleCategoryClick(category.Category_ID)}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-colors text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">
                    {category.Category_Name}
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
                    </p>
                    <p className="text-gray-300">
                      {category.supplier_count} {category.supplier_count === 1 ? 'supplier' : 'suppliers'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}