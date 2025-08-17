import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Building2 } from 'lucide-react';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { useSavedItems } from '../hooks/useSavedItems';
import { useSavedSuppliers } from '../hooks/useSavedSuppliers';
import SupplierCard from '../components/SupplierCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';

export default function SavedItemsPage() {
  const navigate = useNavigate();
  const { data: savedItems = [], isLoading } = useSavedItems();
  const { data: savedSuppliers = [], isLoading: suppliersLoading } = useSavedSuppliers();
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers'>('products');

  const isLoadingAny = isLoading || suppliersLoading;

  return (
    <>
      <SEO 
        title="Saved Items & Suppliers"
        description="View your saved Latin American products and suppliers. Access your curated lists of wholesale products and trusted suppliers."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Saved Items & Suppliers" />

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Saved Products ({savedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Saved Suppliers ({savedSuppliers.length})
            </button>
          </div>

          {isLoadingAny ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : activeTab === 'products' ? (
            savedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300 font-bold mb-4">You haven't saved any products yet.</p>
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
            )
          ) : (
            savedSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300 font-bold mb-4">You haven't saved any suppliers yet.</p>
                <Link
                  to="/suppliers"
                  className="text-[#F4A024] hover:text-[#F4A024]/80 font-bold"
                >
                  Browse suppliers
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {savedSuppliers.map((supplier) => (
                  <SupplierCard 
                    key={supplier.id} 
                    supplier={{
                      Supplier_ID: supplier.id,
                      Supplier_Title: supplier.name,
                      Supplier_Description: supplier.description,
                      Supplier_Website: supplier.website,
                      Supplier_Email: supplier.email,
                      Supplier_Location: supplier.location,
                      Supplier_Whatsapp: supplier.whatsapp,
                      Supplier_Country_Name: supplier.country,
                      Supplier_City_Name: supplier.city,
                      Supplier_Source_ID: supplier.sourceId,
                      product_keywords: ''
                    }} 
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}