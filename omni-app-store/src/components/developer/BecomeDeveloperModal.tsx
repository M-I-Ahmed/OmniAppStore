"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { becomeDeveloper } from '@/lib/userProfileService';

interface BecomeDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeDeveloperModal({ isOpen, onClose }: BecomeDeveloperModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { user, userProfile, setUserProfile } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!user || !agreedToTerms) {
      showToast('Please agree to the terms and conditions', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Applying for developer account, user ID:', user.uid);
      await becomeDeveloper(user.uid);
      console.log('Developer application successful');
      
      // Update local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          isDeveloper: true,
          developerStatus: 'pending',
          publishedApps: []
        });
      }

      showToast('Developer application submitted successfully!', 'success');
      onClose();
    } catch (error: any) {
      console.error('Error applying for developer account:', error);
      const errorMessage = error?.message || 'Failed to submit application';
      showToast(`Error: ${errorMessage}. Please try again.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl max-w-3xl w-full border border-gray-700/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-700/50 px-8 py-6 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Become a Developer
              </h2>
              <p className="text-gray-400 mt-2">
                Join our developer community and start publishing apps
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Benefits Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Developer Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-1">Publish Apps</h4>
                <p className="text-sm text-gray-400">Upload and manage your applications</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-1">Earn Revenue</h4>
                <p className="text-sm text-gray-400">Monetize your apps with our payment system</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-1">Analytics</h4>
                <p className="text-sm text-gray-400">Track downloads and user engagement</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-1">Developer Portal</h4>
                <p className="text-sm text-gray-400">Access advanced tools and resources</p>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">
              Requirements
            </h3>
            <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/30">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Valid email address and active account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Agree to developer terms and conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Complete verification process (typically 1-2 business days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Provide tax information for payouts (can be completed later)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/30">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                I agree to the{' '}
                <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Developer Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-700/50">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!agreedToTerms || isLoading}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
