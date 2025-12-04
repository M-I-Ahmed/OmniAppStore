"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Redirect if not logged in or accessing wrong profile
    if (!loading && (!user || user.uid !== params.id)) {
      showToast("Access denied. Redirecting to home.", "error");
      router.push('/');
    }
  }, [user, params.id, loading, router, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect in useEffect
  }

  const handleManageAssets = () => {
    router.push('/my-assets');
  };

  return (
    <main className="flex-grow px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
                    <p className="text-gray-400">Manage your account and preferences</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="
                    px-4 py-2 bg-blue-600/80 hover:bg-blue-700/90 rounded-xl 
                    text-white font-medium transition-all duration-300 
                    shadow-lg hover:shadow-blue-500/50 hover:scale-105
                    "
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                </div>
            </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* User Info Card */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <div className="text-center mb-6">
              {/* Large Avatar */}
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                {userProfile.forename?.charAt(0)}{userProfile.surname?.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {userProfile.forename} {userProfile.surname}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              {userProfile.organisation && (
                <p className="text-blue-400 mt-1">{userProfile.organisation}</p>
              )}
            </div>

            {/* Profile Stats */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-300">Username</span>
                <span className="text-white font-medium">{userProfile.username}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-300">Apps Owned</span>
                <span className="text-blue-400 font-medium">{userProfile.myAssets?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-300">Member Since</span>
                <span className="text-white font-medium">
                  {userProfile.createdAt?.toDate ? 
                    userProfile.createdAt.toDate().toLocaleDateString() : 
                    'Recent'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Event Log Card */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl flex-1">
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Event Log</h3>
              
              <div className="flex-grow overflow-y-auto">
                <div className="space-y-3">
                  {/* Recent Events */}
                  <div className="flex items-start p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div className="flex-grow min-w-0">
                      <p className="text-white text-sm">Profile created</p>
                      <p className="text-gray-400 text-xs">Welcome to Omni App Store!</p>
                      <p className="text-gray-500 text-xs mt-1">Today</p>
                    </div>
                  </div>

                  <div className="flex items-start p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div className="flex-grow min-w-0">
                      <p className="text-white text-sm">Account verified</p>
                      <p className="text-gray-400 text-xs">Email confirmation received</p>
                      <p className="text-gray-500 text-xs mt-1">Today</p>
                    </div>
                  </div>

                  {/* Placeholder for more events */}
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-xs">More events will appear here as you use the platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Dashboard/Analytics Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl flex-1">
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-bold text-white mb-4 text-center">Dashboard/Analytics</h3>
              <p className="text-gray-400 text-center mb-6">Graphs, charts, Warnings/errors?</p>
              
              <div className="flex-grow flex items-center justify-center">
                {/* Placeholder Dashboard Content */}
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                  {/* Usage Chart Placeholder */}
                  <div className="bg-gray-700/30 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">Usage Analytics</h4>
                    <p className="text-gray-400 text-xs text-center">App usage statistics</p>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-700/30 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">Performance</h4>
                    <p className="text-gray-400 text-xs text-center">System performance metrics</p>
                  </div>

                  {/* Warnings/Alerts */}
                  <div className="bg-gray-700/30 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">Alerts</h4>
                    <p className="text-gray-400 text-xs text-center">System warnings & errors</p>
                  </div>

                  {/* Reports */}
                  <div className="bg-gray-700/30 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">Reports</h4>
                    <p className="text-gray-400 text-xs text-center">Generated reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Quick Action Buttons</h3>
            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/AllApps')}
                className="flex flex-col items-center p-4 bg-gray-700/30 rounded-xl hover:bg-blue-600/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-600/40 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-white">Browse Apps</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700/30 rounded-xl hover:bg-green-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-green-600/40 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-white">Favorites</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700/30 rounded-xl hover:bg-purple-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-purple-600/40 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-white">Settings</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700/30 rounded-xl hover:bg-orange-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-orange-600/40 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-white">Help</span>
              </button>
            </div>
          </div>

          {/* My Apps Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">My Apps</h3>
              <button 
                onClick={() => router.push('/AllApps')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All
              </button>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                </div>
                <p className="text-gray-400 mb-3">No apps in your collection yet</p>
                <button 
                  onClick={() => router.push('/AllApps')}
                  className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700/90 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/50 text-sm"
                >
                  Browse Apps
                </button>
              </div>
            </div>
          </div>

          {/* My Assets Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">My Assets</h3>
              <button
              onClick={handleManageAssets}
              className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Manage Assets
              </button>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-3">No assets registered</p>
                <button className="px-4 py-2 bg-green-600/80 hover:bg-green-700/90 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/50 text-sm">
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="h-screen bg-transparent flex items-center justify-center">
      </section>
    </main>
    
  );
}

