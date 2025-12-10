"use client";

import DeveloperSideNav from '@/components/developer/DeveloperSideNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updateDeveloperProfile, updatePreferences } from '@/lib/userProfileService';

export default function DeveloperSettings() {
  const { user, userProfile, loading, setUserProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Developer Profile Form
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    appUpdates: true,
    newReviews: true,
    payouts: true,
    assetAlerts: true
  });

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isDeveloper || userProfile.developerStatus !== 'verified')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (userProfile?.developerProfile) {
      setCompanyName(userProfile.developerProfile.companyName || '');
      setBio(userProfile.developerProfile.bio || '');
      setWebsite(userProfile.developerProfile.website || '');
    }
    if (userProfile?.preferences?.notifications) {
      setNotifications(userProfile.preferences.notifications as any);
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateDeveloperProfile(user.uid, {
        companyName,
        bio,
        website
      });

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          developerProfile: {
            ...userProfile.developerProfile,
            companyName,
            bio,
            website
          }
        });
      }

      showToast('Profile updated successfully! ✨', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updatePreferences(user.uid, { notifications });

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          preferences: {
            ...userProfile.preferences,
            notifications
          }
        });
      }

      showToast('Notification preferences saved! 🔔', 'success');
    } catch (error) {
      console.error('Error updating notifications:', error);
      showToast('Failed to update preferences. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !userProfile?.isDeveloper) {
    return null;
  }

  return (
    <DeveloperSideNav>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            Developer Settings
          </h1>
          <p className="text-slate-400">Manage your developer profile and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Developer Profile Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Developer Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company/Organization Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp, Independent Developer"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell users about yourself and your apps..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">{bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div>
                  <h3 className="text-slate-100 font-medium">App Updates</h3>
                  <p className="text-sm text-slate-400">Get notified about updates to your connected apps</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.appUpdates}
                  onChange={(e) => setNotifications({ ...notifications, appUpdates: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/50 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div>
                  <h3 className="text-slate-100 font-medium">New Reviews</h3>
                  <p className="text-sm text-slate-400">Get notified when users review your apps</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newReviews}
                  onChange={(e) => setNotifications({ ...notifications, newReviews: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/50 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div>
                  <h3 className="text-slate-100 font-medium">Payouts</h3>
                  <p className="text-sm text-slate-400">Get notified about payout processing and earnings</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.payouts}
                  onChange={(e) => setNotifications({ ...notifications, payouts: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/50 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div>
                  <h3 className="text-slate-100 font-medium">Asset Alerts</h3>
                  <p className="text-sm text-slate-400">Get notified about your asset availability and status</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.assetAlerts}
                  onChange={(e) => setNotifications({ ...notifications, assetAlerts: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/50 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
              </label>

              <button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300">Developer Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile.developerStatus === 'verified' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {userProfile.developerStatus === 'verified' ? '✓ Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300">Email</span>
                <span className="text-slate-100">{user.email}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300">User ID</span>
                <span className="text-slate-100 font-mono text-sm">{user.uid}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300">Member Since</span>
                <span className="text-slate-100">
                  {userProfile.createdAt?.toDate ? 
                    userProfile.createdAt.toDate().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 
                    'Recent'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-slate-400 mb-4">
              These actions are permanent and cannot be undone.
            </p>
            
            <button
              className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-all"
              onClick={() => showToast('Account deletion is not yet implemented', 'error')}
            >
              Delete Developer Account
            </button>
          </div>
        </div>
      </div>
    </DeveloperSideNav>
  );
}
