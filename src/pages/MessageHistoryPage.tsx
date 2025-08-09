import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';
import { useContactHistory } from '../hooks/useContactHistory';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';

export default function MessageHistoryPage() {
  const navigate = useNavigate();
  const { data: history = [], isLoading } = useContactHistory();

  return (
    <>
      <SEO 
        title="Message History"
        description="View your supplier contact history. Track your communications with Latin American suppliers."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs currentPageTitle="Message History" />

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 font-bold mb-4">You haven't contacted any suppliers yet.</p>
              <Link
                to="/"
                className="text-[#F4A024] hover:text-[#F4A024]/80 font-bold"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-100">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-300">{item.product.supplier}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      {item.contactMethod === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      <span>
                        Contacted via {item.contactMethod} on{' '}
                        {new Date(item.contactedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/product/${item.product.id}`}
                    className="text-[#F4A024] hover:text-[#F4A024]/80"
                  >
                    View Product
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}