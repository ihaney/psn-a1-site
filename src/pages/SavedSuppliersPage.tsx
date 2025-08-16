import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import SupplierCard from '../components/SupplierCard';
import { useSavedSuppliers } from '../hooks/useSavedSuppliers';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';

export default function SavedSuppliersPage() {
  const { data: savedSuppliers = [], isLoading } = useSavedSuppliers();

  return (
    <>
      <SEO 
        title="Saved Suppliers"
        description="View your saved Latin American suppliers. Access your curated list of trusted suppliers."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Saved Suppliers" />

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : savedSuppliers.length === 0 ? (
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
          )}
        </div>
      </div>
    </>
  );
}