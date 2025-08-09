import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { useSavedItems } from '../hooks/useSavedItems';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';

export default function SavedItemsPage() {
  const navigate = useNavigate();
  const { data: savedItems = [], isLoading } = useSavedItems();

  return (
    <>
      <SEO 
        title="Saved Items"
        description="View your saved Latin American products. Access your curated list of wholesale products from trusted suppliers."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Saved Items" />

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 font-bold mb-4">You haven't saved any items yet.</p>
              <Link
                to="/"
                className="text-[#F4A024] hover:text-[#F4A024]/80 font-bold"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}