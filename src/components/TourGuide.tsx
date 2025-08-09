import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { createSupplierUrl } from '../utils/urlHelpers';

interface TourStep {
  path: string;
  element: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourData {
  productId: string;
  supplierId: string;
  supplierTitle: string;
}

export default function TourGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('tourDismissed') === 'true';
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [tourData, setTourData] = useState<TourData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch a sample product and its supplier for the tour
  const fetchTourData = async () => {
    try {
      const { data: product } = await supabase
        .from('Products')
        .select(`
          Product_ID,
          Supplier (Supplier_ID, Supplier_Title)
        `)
        .limit(1)
        .single();

      if (product) {
        const tourData = {
          productId: product.Product_ID,
          supplierId: product.Supplier.Supplier_ID,
          supplierTitle: product.Supplier.Supplier_Title
        };
        setTourData(tourData);
        return tourData;
      }
    } catch (error) {
      console.error('Error fetching tour data:', error);
    }
    return null;
  };

  const getTourSteps = (data: TourData | null): TourStep[] => [
    {
      path: '/',
      element: '',
      title: 'Take a Tour',
      description: 'Learn how to navigate and find our products',
      position: 'bottom'
    },
    {
      path: '/',
      element: '[data-tour="search-button"]',
      title: 'Search Products',
      description: 'Search for products across all categories and suppliers. Try searching for specific products or browse by category.',
      position: 'bottom'
    },
    {
      path: data ? `/product/${data.productId}` : '/product/1',
      element: '[data-tour="product-details"]',
      title: 'View Product Details',
      description: 'Get detailed information about products, including pricing, minimum order quantities, and supplier information.',
      position: 'bottom'
    },
    {
      path: data ? `/product/${data.productId}` : '/product/1',
      element: '[data-tour="contact-supplier"]',
      title: 'Contact Supplier',
      description: 'Connect directly with suppliers through email or WhatsApp to inquire about products.',
      position: 'bottom'
    },
    {
      path: data ? createSupplierUrl(data.supplierTitle, data.supplierId) : '/supplier/test-supplier/1',
      element: '[data-tour="supplier-info"]',
      title: 'Supplier Information',
      description: 'View supplier profiles, including their product catalog and contact information.',
      position: 'top'
    },
    {
      path: '/categories',
      element: '[data-tour="categories-grid"]',
      title: 'Product Categories',
      description: 'Browse products by category to find exactly what you\'re looking for.',
      position: 'top'
    },
    {
      path: '/suppliers',
      element: '[data-tour="suppliers-list"]',
      title: 'Supplier Directory',
      description: 'Explore our directory of verified Latin American suppliers.',
      position: 'top'
    },
    {
      path: '/sources',
      element: '[data-tour="sources-list"]',
      title: 'Source Directory',
      description: 'View all the marketplaces and sources where products are listed.',
      position: 'top'
    },
    {
      path: '/countries',
      element: '[data-tour="countries-list"]',
      title: 'Countries Directory',
      description: 'Discover products and suppliers from different Latin American countries.',
      position: 'top'
    }
  ];

  useEffect(() => {
    if (isVisible) {
      const steps = getTourSteps(tourData);
      const step = steps[currentStep];
      
      if (step.element) {
        const element = document.querySelector(step.element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('tour-highlight');
        }
      }
      
      return () => {
        document.querySelectorAll('.tour-highlight').forEach(el => {
          el.classList.remove('tour-highlight');
        });
      };
    }
  }, [currentStep, isVisible, tourData]);

  const startTour = async () => {
    const data = await fetchTourData();
    setTourData(data);
    setIsVisible(true);
    setCurrentStep(0);
    navigate('/');
    analytics.trackEvent('tour_started');
  };

  const nextStep = () => {
    const steps = getTourSteps(tourData);
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      navigate(steps[nextStep].path);
      analytics.trackEvent('tour_step_viewed', {
        props: { step: nextStep + 1, total_steps: steps.length }
      });
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    const steps = getTourSteps(tourData);
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigate(steps[prevStep].path);
    }
  };

  const endTour = () => {
    setIsVisible(false);
    setCurrentStep(0);
    setTourData(null);
    analytics.trackEvent('tour_completed');
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  };

  const dismissTour = () => {
    setIsDismissed(true);
    localStorage.setItem('tourDismissed', 'true');
    analytics.trackEvent('tour_dismissed');
  };

  if (isDismissed) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={startTour}
          className="bg-[#F4A024] text-gray-900 px-4 py-2 rounded-full shadow-lg hover:bg-[#F4A024]/90 transition-colors"
        >
          Take a Tour
        </button>
        <button
          onClick={dismissTour}
          className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss tour button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const steps = getTourSteps(tourData);
  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <button
          onClick={endTour}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
          <p className="text-gray-300">{step.description}</p>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {Array.from({ length: steps.length }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-[#F4A024]' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={nextStep}
                className="bg-[#F4A024] text-gray-900 px-4 py-2 rounded-md hover:bg-[#F4A024]/90 transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}