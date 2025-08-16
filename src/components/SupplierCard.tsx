import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Bookmark } from 'lucide-react';
import { analytics } from '../lib/analytics';
import { createSupplierUrl } from '../utils/urlHelpers';
import { useSavedSuppliers } from '../hooks/useSavedSuppliers';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Supplier {
  Supplier_ID: string;
  Supplier_Title: string;
  Supplier_Description?: string;
  Supplier_Country_Name?: string;
  Supplier_City_Name?: string;
  Supplier_Location?: string;
  product_keywords?: string;
}

interface SupplierCardProps {
  supplier: Supplier;
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  const navigate = useNavigate();
  const { data: savedSuppliers = [], toggleSavedSupplier } = useSavedSuppliers();
  const isSaved = savedSuppliers.some(item => item.id === supplier.Supplier_ID);

  const handleClick = () => {
    // Track analytics
    analytics.trackEvent('supplier_click', {
      props: {
        supplier_id: supplier.Supplier_ID,
        supplier_name: supplier.Supplier_Title,
        supplier_country: supplier.Supplier_Country_Name || 'Unknown'
      }
    });

    navigate(createSupplierUrl(supplier.Supplier_Title, supplier.Supplier_ID));
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to save suppliers');
        return;
      }
      
      const supplierData = {
        id: supplier.Supplier_ID,
        name: supplier.Supplier_Title,
        description: supplier.Supplier_Description || '',
        website: supplier.Supplier_Website || '',
        email: supplier.Supplier_Email || '',
        location: supplier.Supplier_Location || '',
        whatsapp: supplier.Supplier_Whatsapp || '',
        country: supplier.Supplier_Country_Name || 'Unknown',
        city: supplier.Supplier_City_Name || '',
        sourceId: supplier.Supplier_Source_ID || ''
      };
      
      await toggleSavedSupplier(supplierData);
      toast.success(isSaved ? 'Supplier removed from saved suppliers' : 'Supplier saved successfully');
      
      analytics.trackEvent(isSaved ? 'supplier_unsaved' : 'supplier_saved', {
        props: {
          supplier_id: supplier.Supplier_ID,
          supplier_name: supplier.Supplier_Title
        }
      });
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Failed to save supplier. Please try again.');
    }
  };

  return (
    <div className="group relative">
      <div 
        className="cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-200"
        onClick={handleClick}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#F4A024]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F4A024]/20 transition-colors">
              <Building2 className="w-6 h-6 text-[#F4A024]" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-[#F4A024] transition-colors">
              {supplier.Supplier_Title}
            </h3>
            
            {supplier.Supplier_Description && (
              <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                {supplier.Supplier_Description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              {(supplier.Supplier_Country_Name || supplier.Supplier_Location) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {supplier.Supplier_Location || 
                     `${supplier.Supplier_City_Name ? supplier.Supplier_City_Name + ', ' : ''}${supplier.Supplier_Country_Name}`}
                  </span>
                </div>
              )}
            </div>
            
            {supplier.product_keywords && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 line-clamp-1">
                  Keywords: {supplier.product_keywords}
                </p>
              </div>
            )}
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
        <span className="sr-only">{isSaved ? 'Remove from saved' : 'Save supplier'}</span>
      </button>
    </div>
  );
}