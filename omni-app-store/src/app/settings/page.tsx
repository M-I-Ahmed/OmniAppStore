"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { updateDeveloperProfile, updatePreferences } from '@/lib/userProfileService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type TabType = 'profile' | 'notifications' | 'privacy' | 'developer' | 'payment' | 'security' | 'appearance' | 'account';

export default function Settings() {
  const { user, userProfile, loading, setUserProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const entryUrl = useRef<string | null>(null);
  
  // Get tab from URL query parameter, default to 'profile'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Store the entry URL when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && !entryUrl.current) {
      // Get the previous page from document.referrer
      const referrer = document.referrer;
      if (referrer && !referrer.includes('/settings')) {
        entryUrl.current = referrer;
      }
    }
  }, []);

  useEffect(() => {
    if (tabParam && ['profile', 'notifications', 'privacy', 'developer', 'payment', 'security', 'appearance', 'account'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [tabParam]);

  // Profile Form
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Developer Profile Form
  const [companyName, setCompanyName] = useState('');
  const [developerBio, setDeveloperBio] = useState('');
  const [website, setWebsite] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    appUpdates: true,
    newReviews: true,
    payouts: true,
    assetAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
    securityAlerts: true
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showAssets: true,
    allowMessaging: true
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    compactMode: false,
    language: 'en'
  });

  // Payout Settings
  const [payoutSettings, setPayoutSettings] = useState({
    paypalEmail: '',
    bankAccount: '',
    payoutMethod: 'paypal',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      
      if (userProfile.developerProfile) {
        setCompanyName(userProfile.developerProfile.companyName || '');
        setDeveloperBio(userProfile.developerProfile.bio || '');
        setWebsite(userProfile.developerProfile.website || '');
      }
      
      if (userProfile.preferences?.notifications) {
        setNotifications(userProfile.preferences.notifications as any);
      }

      setPayoutSettings({
        paypalEmail: userProfile.paypalEmail || '',
        bankAccount: userProfile.bankAccount || '',
        payoutMethod: userProfile.payoutMethod || 'paypal',
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'Users', user.uid);
      await updateDoc(userRef, {
        displayName,
        bio
      });

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          displayName,
          bio
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

  const handleSaveDeveloperProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateDeveloperProfile(user.uid, {
        companyName,
        bio: developerBio,
        website
      });

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          developerProfile: {
            ...userProfile.developerProfile,
            companyName,
            bio: developerBio,
            website
          }
        });
      }

      showToast('Developer profile updated successfully! ✨', 'success');
    } catch (error) {
      console.error('Error updating developer profile:', error);
      showToast('Failed to update developer profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updatePreferences(user.uid, { notifications });

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

  const handleSavePayoutSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'Users', user.uid);
      await updateDoc(userRef, {
        paypalEmail: payoutSettings.paypalEmail,
        bankAccount: payoutSettings.bankAccount,
        payoutMethod: payoutSettings.payoutMethod,
      });

      showToast('Payout settings updated successfully! 💰', 'success');
    } catch (error) {
      console.error('Error updating payout settings:', error);
      showToast('Failed to update payout settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    // Use replace instead of push to avoid polluting history
    router.replace(`/settings?tab=${tab}`, { scroll: false });
  };

  const handleBack = () => {
    // If we have a stored entry URL, go there, otherwise go back
    if (entryUrl.current) {
      window.location.href = entryUrl.current;
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isDeveloper = userProfile?.isDeveloper && userProfile.developerStatus === 'verified';

  const menuItems = [
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Manage your public profile'
    },
    {
      id: 'notifications' as TabType,
      label: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      description: 'Choose what you want to be notified about'
    },
    {
      id: 'privacy' as TabType,
      label: 'Privacy & Safety',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      description: 'Control your privacy and visibility'
    },
    {
      id: 'appearance' as TabType,
      label: 'Appearance',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      description: 'Customize how the store looks'
    },
    ...(isDeveloper ? [{
      id: 'developer' as TabType,
      label: 'Developer',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      description: 'Developer profile and business settings'
    }] : []),
    ...(isDeveloper ? [{
      id: 'payment' as TabType,
      label: 'Payment & Payouts',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'Manage payout methods and billing'
    }] : []),
    {
      id: 'security' as TabType,
      label: 'Security',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      description: 'Password, 2FA, and account security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="flex max-w-7xl mx-auto">
        {/* Side Navigation */}
        <aside className="w-72 min-h-screen border-r border-slate-700/50 p-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-100 mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Settings</h1>
            <p className="text-sm text-slate-400">Manage your account</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all text-left group ${
                  activeTab === item.id
                    ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/10'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <span className={`mt-0.5 ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Profile Information</h2>
                <p className="text-slate-400 text-sm mb-6">Update your public profile information</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                      {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Upload Photo
                      </button>
                      <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Username
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">@</span>
                        <input
                          type="text"
                          value={userProfile?.username || ''}
                          disabled
                          className="flex-1 px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Your username cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <p className="text-slate-500">Brief description for your profile</p>
                        <p className="text-slate-500">{bio.length}/500</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setDisplayName(userProfile?.displayName || '');
                      setBio(userProfile?.bio || '');
                    }}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Notification Preferences</h2>
                <p className="text-slate-400 text-sm mb-6">Choose what you want to be notified about</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Push Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-slate-100 font-medium">App Updates</h4>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Recommended</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">Get notified when apps you use are updated</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.appUpdates}
                        onChange={(e) => setNotifications({ ...notifications, appUpdates: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Asset Alerts</h4>
                        <p className="text-sm text-slate-400 mt-1">Notifications about your asset availability</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.assetAlerts}
                        onChange={(e) => setNotifications({ ...notifications, assetAlerts: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Security Alerts</h4>
                        <p className="text-sm text-slate-400 mt-1">Important security updates about your account</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.securityAlerts}
                        onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>
                  </div>
                </div>

                {isDeveloper && (
                  <div className="border-t border-slate-700/50 pt-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Developer Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-slate-100 font-medium">New Reviews</h4>
                          <p className="text-sm text-slate-400 mt-1">When users review your apps</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.newReviews}
                          onChange={(e) => setNotifications({ ...notifications, newReviews: e.target.checked })}
                          className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-slate-100 font-medium">Payout Updates</h4>
                          <p className="text-sm text-slate-400 mt-1">Payment processing and earnings notifications</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.payouts}
                          onChange={(e) => setNotifications({ ...notifications, payouts: e.target.checked })}
                          className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Weekly Digest</h4>
                        <p className="text-sm text-slate-400 mt-1">Summary of your activity and recommendations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.weeklyDigest}
                        onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Marketing Emails</h4>
                        <p className="text-sm text-slate-400 mt-1">News, tips, and special offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6 flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Developer Tab */}
          {activeTab === 'developer' && isDeveloper && (
            <>
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
                      Developer Bio
                    </label>
                    <textarea
                      value={developerBio}
                      onChange={(e) => setDeveloperBio(e.target.value)}
                      placeholder="Tell users about yourself and your apps..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">{developerBio.length}/500 characters</p>
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
                    onClick={handleSaveDeveloperProfile}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Developer Profile'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Payout Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 mb-2">Payout Method</label>
                    <select
                      value={payoutSettings.payoutMethod}
                      onChange={(e) => setPayoutSettings({ ...payoutSettings, payoutMethod: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>

                  {payoutSettings.payoutMethod === 'paypal' && (
                    <div>
                      <label className="block text-slate-300 mb-2">PayPal Email</label>
                      <input
                        type="email"
                        value={payoutSettings.paypalEmail}
                        onChange={(e) => setPayoutSettings({ ...payoutSettings, paypalEmail: e.target.value })}
                        placeholder="your-email@example.com"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  )}

                  {payoutSettings.payoutMethod === 'bank' && (
                    <div>
                      <label className="block text-slate-300 mb-2">Bank Account Number</label>
                      <input
                        type="text"
                        value={payoutSettings.bankAccount}
                        onChange={(e) => setPayoutSettings({ ...payoutSettings, bankAccount: e.target.value })}
                        placeholder="Account number"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSavePayoutSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Payout Settings'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Privacy & Safety</h2>
                <p className="text-slate-400 text-sm mb-6">Control who can see your information</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Profile Visibility</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Public Profile</h4>
                        <p className="text-sm text-slate-400 mt-1">Anyone can view your profile</p>
                      </div>
                      <input
                        type="radio"
                        name="visibility"
                        checked={privacy.profileVisibility === 'public'}
                        onChange={() => setPrivacy({ ...privacy, profileVisibility: 'public' })}
                        className="w-5 h-5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Private Profile</h4>
                        <p className="text-sm text-slate-400 mt-1">Only you can see your full profile</p>
                      </div>
                      <input
                        type="radio"
                        name="visibility"
                        checked={privacy.profileVisibility === 'private'}
                        onChange={() => setPrivacy({ ...privacy, profileVisibility: 'private' })}
                        className="w-5 h-5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Information Display</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Show Email Address</h4>
                        <p className="text-sm text-slate-400 mt-1">Display your email on your public profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.showEmail}
                        onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Show Assets</h4>
                        <p className="text-sm text-slate-400 mt-1">Display your assets on your profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.showAssets}
                        onChange={(e) => setPrivacy({ ...privacy, showAssets: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Allow Direct Messages</h4>
                        <p className="text-sm text-slate-400 mt-1">Let other users message you</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.allowMessaging}
                        onChange={(e) => setPrivacy({ ...privacy, allowMessaging: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6 flex justify-end">
                  <button
                    onClick={() => showToast('Privacy settings saved!', 'success')}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Appearance</h2>
                <p className="text-slate-400 text-sm mb-6">Customize how the store looks to you</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.theme === 'dark'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-full h-20 bg-gradient-to-b from-slate-900 to-black rounded mb-3"></div>
                      <div className="text-center text-slate-100 font-medium">Dark</div>
                    </button>

                    <button
                      onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.theme === 'light'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-full h-20 bg-gradient-to-b from-gray-100 to-white rounded mb-3"></div>
                      <div className="text-center text-slate-100 font-medium">Light</div>
                      <span className="text-xs text-slate-500 block mt-1">Coming Soon</span>
                    </button>

                    <button
                      onClick={() => setAppearance({ ...appearance, theme: 'auto' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.theme === 'auto'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-full h-20 bg-gradient-to-r from-slate-900 to-gray-100 rounded mb-3"></div>
                      <div className="text-center text-slate-100 font-medium">Auto</div>
                      <span className="text-xs text-slate-500 block mt-1">System</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Display Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-slate-100 font-medium">Compact Mode</h4>
                        <p className="text-sm text-slate-400 mt-1">Display more content on screen</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearance.compactMode}
                        onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })}
                        className="w-5 h-5 rounded border-blue-500/50 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ml-4"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Language</h3>
                  <select
                    value={appearance.language}
                    onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="en">English</option>
                    <option value="es">Español (Coming Soon)</option>
                    <option value="fr">Français (Coming Soon)</option>
                    <option value="de">Deutsch (Coming Soon)</option>
                  </select>
                </div>

                <div className="border-t border-slate-700/50 pt-6 flex justify-end">
                  <button
                    onClick={() => showToast('Appearance settings saved!', 'success')}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Payment Tab (Developer Only) */}
          {activeTab === 'payment' && isDeveloper && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Payment & Payouts</h2>
                <p className="text-slate-400 text-sm mb-6">Manage how you receive payments</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                <div>
                  <label className="block text-slate-300 mb-3 font-medium">Payout Method</label>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setPayoutSettings({ ...payoutSettings, payoutMethod: 'paypal' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        payoutSettings.payoutMethod === 'paypal'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">💳</div>
                        <div className="text-slate-100 font-medium">PayPal</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPayoutSettings({ ...payoutSettings, payoutMethod: 'bank' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        payoutSettings.payoutMethod === 'bank'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🏦</div>
                        <div className="text-slate-100 font-medium">Bank Transfer</div>
                      </div>
                    </button>
                  </div>

                  {payoutSettings.payoutMethod === 'paypal' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">PayPal Email</label>
                      <input
                        type="email"
                        value={payoutSettings.paypalEmail}
                        onChange={(e) => setPayoutSettings({ ...payoutSettings, paypalEmail: e.target.value })}
                        placeholder="your-email@example.com"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                  )}

                  {payoutSettings.payoutMethod === 'bank' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={payoutSettings.bankAccount}
                          onChange={(e) => setPayoutSettings({ ...payoutSettings, bankAccount: e.target.value })}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Routing Number</label>
                        <input
                          type="text"
                          placeholder="XXXXXXXXX"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-blue-400 font-medium">Payout Schedule</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Payouts are processed monthly. A 15% platform fee is deducted from earnings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6 flex justify-end">
                  <button
                    onClick={handleSavePayoutSettings}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Payment Settings'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Security</h2>
                <p className="text-slate-400 text-sm mb-6">Manage your account security and authentication</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Two-Factor Authentication</h3>
                  <div className="bg-slate-900/30 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-100 font-medium">2FA Status</h4>
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Disabled</span>
                      </div>
                      <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-900/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-slate-100 font-medium">Windows • Chrome</h4>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Current</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">Nottingham, UK • Active now</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                    Sign out of all other sessions
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Account Information</h2>
                
                <div className="space-y-4">
                  {isDeveloper && (
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
                  )}

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
                      {userProfile?.createdAt?.toDate ? 
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
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}

