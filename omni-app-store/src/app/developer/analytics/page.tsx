"use client";

import DeveloperSideNav from '@/components/developer/DeveloperSideNav';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DeveloperAnalytics() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedApp, setSelectedApp] = useState<string>('all');

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isDeveloper || userProfile.developerStatus !== 'verified')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (user && userProfile?.isDeveloper) {
      fetchAnalyticsData();
    }
  }, [user, userProfile]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const appsQuery = query(
        collection(db, 'Apps'),
        where('developerId', '==', user.uid)
      );
      const appsSnapshot = await getDocs(appsQuery);
      
      const myApps = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setApps(myApps);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getTotalDownloads = () => {
    if (selectedApp === 'all') {
      return apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
    }
    const app = apps.find(a => a.id === selectedApp);
    return app?.downloads || 0;
  };

  const getAverageRating = () => {
    const appsToAnalyze = selectedApp === 'all' 
      ? apps 
      : apps.filter(a => a.id === selectedApp);
    
    const ratingsSum = appsToAnalyze.reduce((sum, app) => sum + (app.rating || 0), 0);
    const count = appsToAnalyze.filter(app => app.rating).length;
    return count > 0 ? (ratingsSum / count).toFixed(1) : 'N/A';
  };

  const getTotalRevenue = () => {
    if (selectedApp === 'all') {
      return apps.reduce((sum, app) => sum + ((app.downloads || 0) * (app.AppPrice || 0)), 0);
    }
    const app = apps.find(a => a.id === selectedApp);
    return (app?.downloads || 0) * (app?.AppPrice || 0);
  };

  if (loading || loadingData) {
    return (
      <DeveloperSideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DeveloperSideNav>
    );
  }

  if (!user || !userProfile?.isDeveloper) {
    return null;
  }

  return (
    <DeveloperSideNav>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">
              Analytics
            </h1>
            <p className="text-slate-400">Track your app performance and user engagement</p>
          </div>

          {/* App Filter */}
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          >
            <option value="all">All Apps</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>{app.AppName}</option>
            ))}
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">{getTotalDownloads().toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Total Downloads</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">{getAverageRating()}</h3>
            <p className="text-slate-400 text-sm">Average Rating</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">${getTotalRevenue().toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Total Revenue</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">{Math.floor(getTotalDownloads() * 0.6).toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Active Users</p>
          </div>
        </div>

        {/* Downloads Chart Placeholder */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Downloads Over Time</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-slate-500">Chart visualization coming soon</p>
              <p className="text-xs text-slate-600 mt-2">Integrate Chart.js or Recharts for data visualization</p>
            </div>
          </div>
        </div>

        {/* App Performance Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">App Performance</h2>
          
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No apps published yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium py-3 px-4">App Name</th>
                    <th className="text-left text-slate-400 font-medium py-3 px-4">Category</th>
                    <th className="text-right text-slate-400 font-medium py-3 px-4">Downloads</th>
                    <th className="text-right text-slate-400 font-medium py-3 px-4">Rating</th>
                    <th className="text-right text-slate-400 font-medium py-3 px-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-slate-100 font-medium">{app.AppName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-300 text-sm">{app.AppCategory || 'Uncategorized'}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-blue-400 font-medium">{(app.downloads || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-yellow-400 font-medium">{app.rating?.toFixed(1) || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-400 font-medium">
                          ${((app.downloads || 0) * (app.AppPrice || 0)).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DeveloperSideNav>
  );
}
