import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  currentPageTitle: string;
}

interface HistoryEntry {
  path: string;
  title: string;
}

export default function Breadcrumbs({ currentPageTitle }: BreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previousPage, setPreviousPage] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    // Get history stack from sessionStorage
    const historyStack = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]') as HistoryEntry[];
    
    // Find the previous page (second to last entry)
    if (historyStack.length > 1) {
      setPreviousPage(historyStack[historyStack.length - 2]);
    } else {
      setPreviousPage(null);
    }
  }, [location.pathname]);

  const handleLinkHover = (path: string) => {
    // Prefetch data based on the path
    if (path.startsWith('/product/')) {
      const productId = path.split('/').pop();
      if (productId) {
        queryClient.prefetchQuery({
          queryKey: ['product', productId],
          queryFn: async () => {
            const { data } = await supabase
              .from('Products')
              .select('*')
              .eq('Product_ID', productId)
              .single();
            return data;
          }
        });
      }
    } else if (path.startsWith('/search')) {
      const params = new URLSearchParams(path.split('?')[1]);
      const category = params.get('category');
      const query = params.get('q');
      
      if (category) {
        queryClient.prefetchQuery({
          queryKey: ['searchResults', { category }],
          queryFn: async () => {
            const { data } = await supabase
              .from('Products')
              .select('*')
              .eq('Product_Category_ID', category)
              .limit(20);
            return data;
          }
        });
      } else if (query) {
        // Prefetch search results
        queryClient.prefetchQuery({
          queryKey: ['searchResults', { query }],
          queryFn: async () => {
            const searchResults = await productsIndex.search(query, {
              limit: 20
            });
            return searchResults.hits;
          }
        });
      }
    }
  };

  const handlePreviousClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1);
  };

  if (!previousPage) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">{currentPageTitle}</h1>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center text-sm mb-2">
        <Link
          to="#"
          onMouseEnter={() => previousPage && handleLinkHover(previousPage.path)}
          onClick={handlePreviousClick}
          className="text-[#F4A024] hover:text-[#F4A024]/80 font-medium"
        >
          {previousPage.title}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />
        <span className="text-gray-300">{currentPageTitle}</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-100">{currentPageTitle}</h1>
    </div>
  );
}