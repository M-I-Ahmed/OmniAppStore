"use client";

import DeveloperSideNav from '@/components/developer/DeveloperSideNav';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DeveloperDashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalApps: 0,
    totalDownloads: 0,
    totalEarnings: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isDeveloper || userProfile.developerStatus !== 'verified')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (user && userProfile?.isDeveloper) {
      fetchDeveloperStats();
    }
  }, [user, userProfile]);

  const fetchDeveloperStats = async () => {
    if (!user) return;

    try {
      // Get published apps count
      const appsQuery = query(
        collection(db, 'Apps'),
        where('developerId', '==', user.uid)
      );
      const appsSnapshot = await getDocs(appsQuery);
      
      // Calculate stats from published apps
      let totalDownloads = 0;
      appsSnapshot.docs.forEach(doc => {
        const appData = doc.data();
        totalDownloads += appData.downloads || 0;
      });

      setStats({
        totalApps: userProfile?.publishedApps?.length || 0,
        totalDownloads,
        totalEarnings: userProfile?.totalEarnings || 0,
        activeUsers: Math.floor(totalDownloads * 0.6) // Estimate: 60% of downloads are active
      });
    } catch (error) {
      console.error('Error fetching developer stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !userProfile?.isDeveloper) {
    return null;
  }

  return (
    <DeveloperSideNav>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Developer Dashboard
          </h1>
          <p className="text-slate-400">Welcome back, {userProfile.displayName}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Apps */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="text-xs text-cyan-400 font-medium">+2 this month</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalApps}</h3>
            <p className="text-slate-400 text-sm">Published Apps</p>
          </div>

          {/* Total Downloads */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-blue-500/20 p-6 shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="text-xs text-blue-400 font-medium">+12% this week</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalDownloads.toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Total Downloads</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-green-500/20 p-6 shadow-lg shadow-green-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-green-400 font-medium">+8% this month</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">${stats.totalEarnings.toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Total Earnings</p>
          </div>

          {/* Active Users */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-purple-500/20 p-6 shadow-lg shadow-purple-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs text-purple-400 font-medium">+5% this week</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.activeUsers.toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Active Users</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/developer/upload')}
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload New App</h3>
            <p className="text-slate-400 text-sm">Publish a new application to the store</p>
          </button>

          <button
            onClick={() => router.push('/developer/analytics')}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 hover:from-blue-500/20 hover:to-purple-500/20 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
            <p className="text-slate-400 text-sm">Track your app performance and user engagement</p>
          </button>

          <button
            onClick={() => router.push('/developer/earnings')}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 hover:from-green-500/20 hover:to-emerald-500/20 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Earnings</h3>
            <p className="text-slate-400 text-sm">View revenue and manage payout settings</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-400">No recent activity</p>
                <p className="text-slate-500 text-sm mt-2">Activity will appear here as users interact with your apps</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.description}</p>
                    <p className="text-slate-400 text-sm">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DeveloperSideNav>
  );
}
