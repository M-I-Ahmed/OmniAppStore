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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
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
        </div>

        {/* Right Column - Dashboard Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 bg-gray-700/50 rounded-xl hover:bg-blue-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-600/40 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Browse Apps</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700/50 rounded-xl hover:bg-green-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-green-600/40 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Favorites</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700/50 rounded-xl hover:bg-purple-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-purple-600/40 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Analytics</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700/50 rounded-xl hover:bg-orange-600/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-orange-600/40 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {/* Placeholder activity items */}
              <div className="flex items-center p-3 bg-gray-700/30 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-grow">
                  <p className="text-white text-sm">Welcome to Omni App Store!</p>
                  <p className="text-gray-400 text-xs">Account created</p>
                </div>
                <span className="text-gray-500 text-xs">Today</span>
              </div>
              
              <div className="text-center py-8">
                <p className="text-gray-400">No recent activity</p>
                <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                  Explore apps to get started
                </button>
              </div>
            </div>
          </div>

          {/* My Apps Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">My Apps</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                View All
              </button>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">No apps in your collection yet</p>
              <button 
                onClick={() => router.push('/AllApps')}
                className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700/90 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
              >
                Browse Apps
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

