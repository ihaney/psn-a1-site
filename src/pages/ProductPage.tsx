import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Share2, Bookmark } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import type { Product } from '../types';
import toast from 'react-hot-toast';
import { useSavedItems } from '../hooks/useSavedItems';
import { useContactHistory } from '../hooks/useContactHistory';
import { useSimilarProducts } from '../hooks/useSimilarProducts';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { createSupplierUrl } from '../utils/urlHelpers';

interface ExtendedProduct extends Product {
  supplierEmail?: string;
  supplierWhatsapp?: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const { data: savedItems = [], toggleSavedItem } = useSavedItems();
  const { recordContact } = useContactHistory();
  const { data: similarProducts = [], isLoading: loadingSimilar } = useSimilarProducts(id || '');
  
  // Use react-query to fetch product data
  const { 
    data: product, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      
      // First check if the product exists
      const { count, error: countError } = await supabase
        .from('Products')
        .select('Product_ID', { count: 'exact', head: true })
        .eq('Product_ID', id);

      if (countError) throw countError;
      if (count === 0) return null;

      // Fetch product data
      const { data: productData, error: productError } = await supabase
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
        .eq('Product_ID', id)
        .maybeSingle();

      if (productError) throw productError;
      if (!productData) return null;

      // Track view
      analytics.trackEvent('product_view', {
        props: {
          product_id: productData.Product_ID,
          product_name: productData.Product_Title,
          product_category: productData.Product_Category_Name,
          product_country: productData.Product_Country_Name
        }
      });

      return productData;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Fetch supplier contact information
  const { data: supplierContact } = useQuery({
    queryKey: ['supplierContact', id],
    queryFn: async () => {
      if (!product?.Product_Supplier_ID) return null;
      
      const { data, error } = await supabase
        .from('Supplier')
        .select('Supplier_Email, Supplier_Whatsapp')
        .eq('Supplier_ID', product.Product_Supplier_ID)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!product?.Product_Supplier_ID,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Format product data with supplier contact info
  const formattedProduct = product ? {
    id: product.Product_ID,
    name: product.Product_Title,
    Product_Price: product.Product_Price || '$0',
    image: product.Product_Image_URL || '',
    country: product.Product_Country_Name || 'Unknown',
    category: product.Product_Category_Name || 'Unknown',
    supplier: product.Product_Supplier_Name || 'Unknown',
    supplierEmail: supplierContact?.Supplier_Email || '',
    supplierWhatsapp: supplierContact?.Supplier_Whatsapp || '',
    Product_MOQ: product.Product_MOQ || '0',
    sourceUrl: product.Product_URL || '',
    marketplace: product.Product_Source_Name || 'Unknown'
  } : null;
  
  const isSaved = savedItems.some(item => item.id === formattedProduct?.id);

  const handleShare = () => {
    if (!formattedProduct) return;

    const shareUrl = window.location.href;
    const shareText = `I found this product on Paisán.\n\n${formattedProduct.name}\n\n${shareUrl}`;

    if (isMobile) {
      // Use SMS sharing on mobile
      window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
    } else {
      // Use email sharing on desktop
      const subject = encodeURIComponent(`Check out this product on Paisán`);
      window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(shareText)}`;
    }

    analytics.trackEvent('product_share', {
      props: {
        product_id: formattedProduct.id,
        product_name: formattedProduct.name,
        share_method: isMobile ? 'sms' : 'email'
      }
    });
  };

  const handleSaveClick = async () => {
    if (!formattedProduct) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to save items');
        return;
      }
      
      await toggleSavedItem(formattedProduct);
      toast.success(isSaved ? 'Item removed from saved items' : 'Item saved successfully');
      
      analytics.trackEvent(isSaved ? 'item_unsaved' : 'item_saved', {
        props: {
          product_id: formattedProduct.id,
          product_name: formattedProduct.name
        }
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleContact = async (method: 'email' | 'whatsapp') => {
    if (!formattedProduct) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to contact suppliers');
        return;
      }

      await recordContact(formattedProduct.id, method);
      
      analytics.trackEvent('contact_supplier_click', {
        props: {
          product_id: formattedProduct.id,
          product_name: formattedProduct.name,
          supplier: formattedProduct.supplier,
          contact_method: method
        }
      });
    } catch (error) {
      console.error('Error recording contact:', error);
    }
  };

  const handleSourceLinkClick = () => {
    if (!formattedProduct) return;

    analytics.trackEvent('source_link_click', {
      props: {
        product_id: formattedProduct.id,
        product_name: formattedProduct.name,
        marketplace: formattedProduct.marketplace
      }
    });
  };

  if (loading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#F4A024]">{error ? 'Error loading product' : 'Loading product...'}</div>
      </div>
    );
  }

  if (!formattedProduct) {
    return (
      <>
        <SEO 
          title="Product Not Found"
          description="The requested product could not be found. Browse our other Latin American products."
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100">Product not found</h2>
          </div>
        </div>
      </>
    );
  }

  const currentUrl = window.location.href;
  const emailSubject = encodeURIComponent(formattedProduct.name);
  const emailBody = encodeURIComponent(`Hello, I am interested in this product that you offer. I found the listing from Paisán:\n\n${formattedProduct.name}\n${currentUrl}`);
  const whatsappMessage = encodeURIComponent(`Hello, I am interested in this product that you offer. I found the listing from Paisán:\n\n${formattedProduct.name}\n${currentUrl}`);

  const getContactLink = () => {
    if (formattedProduct.supplierEmail) {
      return `mailto:${formattedProduct.supplierEmail}?subject=${emailSubject}&body=${emailBody}`;
    } else if (formattedProduct.supplierWhatsapp) {
      const whatsappNumber = formattedProduct.supplierWhatsapp.replace(/\D/g, '');
      return `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    }
    return '#';
  };

  const getContactText = () => {
    if (formattedProduct.supplierEmail) {
      return 'Contact Supplier via Email';
    } else if (formattedProduct.supplierWhatsapp) {
      return 'Contact Supplier via WhatsApp';
    }
    return 'Contact Supplier';
  };

  return (
    <>
      <SEO 
        title={formattedProduct.name}
        description={`Buy ${formattedProduct.name} from ${formattedProduct.supplier}. ${formattedProduct.category} products from ${formattedProduct.country}. MOQ: ${formattedProduct.Product_MOQ} units.`}
        keywords={`${formattedProduct.name}, ${formattedProduct.category}, ${formattedProduct.country}, ${formattedProduct.supplier}, wholesale, B2B, Latin American products`}
        image={formattedProduct.image}
        type="product"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle={formattedProduct.name} />
          
          <div className="flex justify-end mb-4">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 font-bold text-[#F4A024] hover:text-[#F4A024]/80"
              title={`Share via ${isMobile ? 'SMS' : 'email'}`}
            >
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div 
              className="aspect-square overflow-hidden rounded-lg bg-gray-800/50"
              data-tour="product-details"
            >
              <img
                src={formattedProduct.image}
                alt={formattedProduct.name}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">{formattedProduct.name}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-xl text-[#F4A024]">{formattedProduct.Product_Price}</p>
                  <span className="px-2 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                    {formattedProduct.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-100">Country</h3>
                    <p className="mt-1">{formattedProduct.country}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-100">Category</h3>
                    <p className="mt-1">{formattedProduct.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-100">MOQ</h3>
                    <p className="mt-1">{formattedProduct.Product_MOQ} units</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-100">Supplier</h3>
                    <button
                      onClick={() => {
                        // We need to get the supplier ID first
                        if (formattedProduct.supplierEmail || formattedProduct.supplierWhatsapp) {
                          // If we have supplier contact info, we can fetch the supplier ID
                          supabase
                            .from('Supplier')
                            .select('Supplier_ID')
                            .eq('Supplier_Title', formattedProduct.supplier)
                            .single()
                            .then(({ data }) => {
                              if (data) {
                                navigate(createSupplierUrl(formattedProduct.supplier, data.Supplier_ID));
                              }
                            });
                        }
                      }}
                      className="mt-1 text-left text-[#F4A024] hover:text-[#F4A024]"
                    >
                      {formattedProduct.supplier}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-100">Original Source</h3>
                  <a
                    href={formattedProduct.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center text-[#F4A024] hover:text-[#F4A024]"
                    onClick={handleSourceLinkClick}
                  >
                    View on {formattedProduct.marketplace}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>

              {(formattedProduct.supplierEmail || formattedProduct.supplierWhatsapp) && (
                <div className="flex gap-4">
                  <a
                    href={getContactLink()}
                    className="btn-primary flex-1 py-3 text-center block"
                    data-tour="contact-supplier"
                    onClick={() => handleContact(formattedProduct.supplierEmail ? 'email' : 'whatsapp')}
                    target={formattedProduct.supplierWhatsapp ? "_blank" : undefined}
                    rel={formattedProduct.supplierWhatsapp ? "noopener noreferrer" : undefined}
                  >
                    {getContactText()}
                  </a>
                  <button
                    onClick={handleSaveClick}
                    className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      isSaved 
                        ? 'bg-gray-800 text-[#F4A024]' 
                        : 'bg-gray-800 text-gray-300 hover:text-[#F4A024]'
                    }`}
                  >
                    <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                    <span className="sr-only">{isSaved ? 'Remove from saved' : 'Save item'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-100 mb-8">
                Related Products
              </h2>
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {similarProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}