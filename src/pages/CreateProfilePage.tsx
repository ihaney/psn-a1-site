import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import { logError } from '../lib/errorLogging';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    city: '',
    country: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('No user found. Please sign in again.');
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          auth_id: user.id,
          email: formData.email,
          username: formData.username,
          city: formData.city,
          country: formData.country
        });

      if (profileError) {
        await logError(profileError, {
          type: 'profile_creation_error',
          context: {
            userId: user.id,
            formData
          }
        });
        throw profileError;
      }

      analytics.trackEvent('profile_created');
      toast.success('Profile created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create profile. Please try again.');
      
      await logError(error instanceof Error ? error : new Error('Profile creation failed'), {
        type: 'profile_creation_error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Create Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username *
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
            Country *
          </label>
          <input
            type="text"
            id="country"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner /> : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}