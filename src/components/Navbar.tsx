import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Menu, ChevronDown, X, Bookmark, UserCircle, MessageSquare, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import SearchModal from './SearchModal';
import { useSavedItems } from '../hooks/useSavedItems';
import { useSavedSuppliers } from '../hooks/useSavedSuppliers';
import { useContactHistory } from '../hooks/useContactHistory';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';
import { isBrowser } from '../lib/isomorphic-helpers';

interface Category {
  Category_ID: string;
  Category_Name: string;
}

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { data: savedItems = [] } = useSavedItems();
  const { data: savedSuppliers = [] } = useSavedSuppliers();
  const { data: contactHistory = [] } = useContactHistory();
  const [user, setUser] = useState<any>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('Categories')
        .select('Category_ID, Category_Name')
        .order('Category_Name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      analytics.trackEvent('sign_out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleIconClick = (feature: string) => {
    if (!user) {
      toast.error('Please log in to use this feature');
      setIsAuthOpen(true);
    }
  };

  const trackNavigation = (type: string, name: string) => {
    analytics.trackEvent('navigation_click', {
      props: { nav_type: type, item_name: name },
    });
    
    // Prefetch data based on navigation type
    if (type === 'category' && name) {
      // Prefetch products for this category
      queryClient.prefetchQuery({
        queryKey: ['searchResults', { category: name }],
        queryFn: async () => {
          const { data } = await supabase
            .from('Products')
            .select('*')
            .eq('Product_Category_Name', name)
            .limit(20);
          return data;
        }
      });
    } else if (type === 'menu' && name === 'products') {
      // Prefetch featured products
      queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: async () => {
          const { data } = await supabase
            .from('Products')
            .select('*')
            .limit(20);
          return data;
        }
      });
    } else if (type === 'menu' && name === 'suppliers') {
      // Prefetch suppliers list
      queryClient.prefetchQuery({
        queryKey: ['suppliers', 0, 100],
        queryFn: async () => {
          const { data } = await supabase
            .rpc('get_suppliers_with_product_count', {
              limit_count: 100,
              offset_count: 0
            });
          return data;
        }
      });
    }
  };

  const handleMouseEnter = (dropdown: string) => {
    if (isBrowser && window.innerWidth >= 768) {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        setDropdownTimeout(null);
      }
      setActiveDropdown(dropdown);
    }
  };

  const handleMouseLeave = () => {
    if (isBrowser && window.innerWidth >= 768) {
      const timeout = setTimeout(() => {
        setActiveDropdown(null);
      }, 300);
      setDropdownTimeout(timeout);
    }
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setDropdownTimeout(timeout);
  };

  const toggleMobileDropdown = (dropdown: string) =>
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-black z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2" 
                onClick={() => trackNavigation('logo', 'home')}
              >
                
                <h1 className="text-3xl font-bold text-[#F4A024] paisan-text">Paisán</h1>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('discover')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md">
                    Discover
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {activeDropdown === 'discover' && (
                    <div 
                      className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          to="/products"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'products');
                          }}
                        >
                          All Products
                        </Link>
                        <Link
                          to="/suppliers"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'suppliers');
                          }}
                        >
                          Suppliers
                        </Link>
                        <Link
                          to="/sources"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'sources');
                          }}
                        >
                          Sources
                        </Link>
                        <Link
                          to="/countries"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'countries');
                          }}
                        >
                          Countries
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('categories')}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to="/categories"
                    className="flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md"
                    onClick={() => trackNavigation('menu', 'categories')}
                  >
                    Categories
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Link>

                  {activeDropdown === 'categories' && (
                    <div 
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          to="/categories"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700 font-medium border-b border-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'all-categories');
                          }}
                        >
                          View All Categories
                        </Link>
                        {categories.slice(0, 8).map((category) => (
                          <Link
                            key={category.Category_ID}
                            to={`/search?category=${category.Category_ID}`}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                            onClick={() => {
                              closeMobileMenu();
                              trackNavigation('category', category.Category_Name);
                            }}
                          >
                            {category.Category_Name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('tools')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md">
                    Tools
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  {activeDropdown === 'tools' && (
                    <div 
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          to="/tools/rfq-template"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('tools', 'rfq-template');
                          }}
                        >
                          RFQ Template
                        </Link>
                        <Link
                          to="/tools/tariff-calculator"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('tools', 'tariff-calculator');
                          }}
                        >
                          Tariff Calculator
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('about')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md">
                    About
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {activeDropdown === 'about' && (
                    <div 
                      className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          to="/about"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'about');
                          }}
                        >
                          About Us
                        </Link>
                        <Link
                          to="/policies"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'policies');
                          }}
                        >
                          Policies
                        </Link>
                        <Link
                          to="/contact"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('menu', 'contact');
                          }}
                        >
                          Contact
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSearchOpen(true);
                  analytics.trackEvent('search_open');
                }}
                className="text-gray-300 hover:text-gray-100 p-2 rounded-full relative group"
                aria-label="Search"
                data-tour="search-button"
              >
                <Search className="w-5 h-5" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Search
                </span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                    className="text-gray-300 hover:text-gray-100 p-2 rounded-full relative group"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Account
                    </span>
                  </button>
                  {activeDropdown === 'user' && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            setActiveDropdown(null);
                            trackNavigation('profile', 'view-profile');
                          }}
                        >
                          View Profile
                        </Link>
                        <Link
                          to="/saved-suppliers"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            setActiveDropdown(null);
                            trackNavigation('profile', 'saved-suppliers');
                          }}
                        >
                          Saved Suppliers
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setActiveDropdown(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-gray-300 hover:text-gray-100 p-2 rounded-full relative group"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign In
                  </span>
                </button>
              )}

              <Link 
                to="/message-history"
                className="text-gray-300 hover:text-gray-100 p-2 rounded-full relative group"
                onClick={() => handleIconClick('message-history')}
                aria-label="Message History"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Message History
                </span>
              </Link>

              <Link 
                to="/saved-items"
                className="text-gray-300 hover:text-gray-100 p-2 rounded-full relative group"
                onClick={() => handleIconClick('saved-items')}
                aria-label="Saved Items"
              >
                <Bookmark className="w-5 h-5" fill={user && savedItems.length > 0 ? 'currentColor' : 'none'} />
                {user && savedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {savedItems.length}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Saved Items
                </span>
              </Link>


              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-gray-100 p-2 rounded-full"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-gray-800 z-40 max-h-[80vh] overflow-y-auto shadow-md rounded-b-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <div>
                <button
                  onClick={() => toggleMobileDropdown('discover')}
                  className="w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50"
                >
                  Discover
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${activeDropdown === 'discover' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'discover' && (
                  <div className="pl-4 space-y-2 bg-gray-700">
                    <Link
                      to="/products"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'products');
                      }}
                    >
                      All Products
                    </Link>
                    <Link
                      to="/suppliers"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'suppliers');
                      }}
                    >
                      Suppliers
                    </Link>
                    <Link
                      to="/sources"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'sources');
                      }}
                    >
                      Sources
                    </Link>
                    <Link
                      to="/countries"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'countries');
                      }}
                    >
                      Countries
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleMobileDropdown('categories')}
                  className="w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50"
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${activeDropdown === 'categories' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'categories' && (
                  <div className="pl-4 space-y-2 bg-gray-700">
                    <Link
                      to="/categories"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024] font-medium border-b border-gray-600"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'all-categories');
                      }}
                    >
                      View All Categories
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.Category_ID}
                        to={`/search?category=${category.Category_ID}`}
                        className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                        onClick={() => {
                          closeMobileMenu();
                          trackNavigation('mobile_category', category.Category_Name);
                        }}
                      >
                        {category.Category_Name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleMobileDropdown('tools')}
                  className="w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50"
                >
                  Tools
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${activeDropdown === 'tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'tools' && (
                  <div className="pl-4 space-y-2 bg-gray-700">
                    <Link
                      to="/tools/rfq-template"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_tools', 'rfq-template');
                      }}
                    >
                      RFQ Template
                    </Link>
                    <Link
                      to="/tools/tariff-calculator"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_tools', 'tariff-calculator');
                      }}
                    >
                      Tariff Calculator
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleMobileDropdown('about')}
                  className="w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50"
                >
                  About
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'about' && (
                  <div className="pl-4 space-y-2 bg-gray-700">
                    <Link
                      to="/about"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'about');
                      }}
                    >
                      About Us
                    </Link>
                    <Link
                      to="/policies"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'policies');
                      }}
                    >
                      Policies
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-3 py-2 text-gray-300 hover:text-[#F4A024]"
                      onClick={() => {
                        closeMobileMenu();
                        trackNavigation('mobile_menu', 'contact');
                      }}
                    >
                      Contact
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}