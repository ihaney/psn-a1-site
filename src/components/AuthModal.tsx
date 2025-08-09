import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import { logError } from '../lib/errorLogging';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!authData.user) {
          throw new Error('No user returned from signup');
        }

        toast.success('Account created successfully!');
        analytics.trackEvent('sign_up_success');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Signed in successfully!');
        analytics.trackEvent('sign_in_success');
        onClose();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        }
      }
      
      await logError(error instanceof Error ? error : new Error(errorMessage), {
        type: isSignUp ? 'sign_up_error' : 'sign_in_error',
        context: {
          email,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        }
      });
      
      toast.error(errorMessage);
      analytics.trackEvent(isSignUp ? 'sign_up_error' : 'sign_in_error', {
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-100 mb-6">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-gray-800/50 text-white placeholder-gray-400 border ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-gray-800/50 text-white placeholder-gray-400 border ${
                errors.password ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]`}
              placeholder="Enter your password"
              minLength={6}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            className="text-[#F4A024] hover:text-[#F4A024]/80 text-sm"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}