import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Bookmark, User, MapPin, Calendar, Mail } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSavedItems } from '../hooks/useSavedItems';
import { useContactHistory } from '../hooks/useContactHistory';
import Breadcrumbs from '../components/Breadcrumbs';

interface UserProfile {
  id: string;
  auth_id: string;
  email: string;
  username?: string;
  city?: string;
  country?: string;
  created_at: string;
  updated_at?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { data: savedItems = [] } = useSavedItems();
  const { data: messageHistory = [] } = useContactHistory();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (!profileData) {
          navigate('/create-profile');
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Breadcrumbs currentPageTitle="Profile Not Found" />
          <p className="text-gray-300 mb-4">Please sign in to view your profile.</p>
          <Link
            to="/create-profile"
            className="btn-primary"
          >
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Your Profile"
        description="View and manage your profile settings"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs currentPageTitle="Your Profile" />
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-[#F4A024] rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">
                  {profile.username || 'User Profile'}
                </h1>
                <p className="text-gray-400">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Personal Information</h2>
                
                <div className="space-y-4">
                  {profile.username && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#F4A024]" />
                      <div>
                        <p className="text-sm text-gray-400">Username</p>
                        <p className="text-gray-100">{profile.username}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#F4A024]" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-gray-100">{profile.email}</p>
                    </div>
                  </div>
                  
                  {(profile.city || profile.country) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#F4A024]" />
                      <div>
                        <p className="text-sm text-gray-400">Location</p>
                        <p className="text-gray-100">
                          {[profile.city, profile.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#F4A024]" />
                    <div>
                      <p className="text-sm text-gray-400">Member since</p>
                      <p className="text-gray-100">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Activity Summary</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#F4A024] mb-1">
                      {savedItems.length}
                    </div>
                    <div className="text-sm text-gray-400">Saved Items</div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#F4A024] mb-1">
                      {messageHistory.length}
                    </div>
                    <div className="text-sm text-gray-400">Contacts Made</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/saved-items"
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="w-5 h-5 text-[#F4A024]" />
                      <span className="text-gray-100">Saved Items</span>
                    </div>
                    {savedItems.length > 0 && (
                      <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                        {savedItems.length}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    to="/message-history"
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#F4A024]" />
                      <span className="text-gray-100">Message History</span>
                    </div>
                    {messageHistory.length > 0 && (
                      <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                        {messageHistory.length}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          {(savedItems.length > 0 || messageHistory.length > 0) && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Recent Activity</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {savedItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-4">Recently Saved</h3>
                    <div className="space-y-3">
                      {savedItems.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          to={`/product/${item.id}`}
                          className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-100 font-medium truncate">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.supplier}</p>
                          </div>
                        </Link>
                      ))}
                      {savedItems.length > 3 && (
                        <Link
                          to="/saved-items"
                          className="block text-center text-[#F4A024] hover:text-[#F4A024]/80 text-sm py-2"
                        >
                          View all {savedItems.length} saved items
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {messageHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-4">Recent Contacts</h3>
                    <div className="space-y-3">
                      {messageHistory.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          to={`/product/${item.product.id}`}
                          className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          {item.product.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-100 font-medium truncate">{item.product.name}</p>
                            <p className="text-sm text-gray-400">
                              Contacted {item.product.supplier} via {item.contactMethod}
                            </p>
                          </div>
                        </Link>
                      ))}
                      {messageHistory.length > 3 && (
                        <Link
                          to="/message-history"
                          className="block text-center text-[#F4A024] hover:text-[#F4A024]/80 text-sm py-2"
                        >
                          View all {messageHistory.length} contacts
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}