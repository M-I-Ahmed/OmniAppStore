'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, getDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logUserEvent } from '@/lib/eventLogger';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  AppName: string;
  Description: string;
  Tags: string[];
  Price: number;
  AverageRating: number;
  DeveloperID: string;
  CompatibleAssets: string[];
  iconURL?: string;
  TrustScore: number;
}

export default function MyAppsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserApps();
    }
  }, [user]);

  const fetchUserApps = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get user's app IDs from their profile
      const userRef = doc(db, 'User_Profiles', user.uid);
      const userDocSnap = await getDoc(userRef);
      
      if (!userDocSnap.exists()) {
        console.log('User profile not found');
        setApps([]);
        setIsLoading(false);
        return;
      }

      const userProfile = userDocSnap.data();
      const userAppIds = userProfile?.myApps || [];

      console.log('User app IDs:', userAppIds);

      if (userAppIds.length === 0) {
        console.log('No apps linked to user');
        setApps([]);
        setIsLoading(false);
        return;
      }

      // Fetch all apps from the Apps collection
      const appsRef = collection(db, 'Apps');
      const appsSnapshot = await getDocs(appsRef);
      
      console.log('Total apps in database:', appsSnapshot.docs.length);

      // Filter to only include user's apps
      const userApps = appsSnapshot.docs
        .filter(doc => userAppIds.includes(doc.id))
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as App[];

      console.log('User apps found:', userApps.length);

      setApps(userApps);
    } catch (error) {
      console.error('Error fetching user apps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveApp = async (appId: string) => {
    if (!user) return;

    const appToRemove = apps.find(a => a.id === appId);
    const appName = appToRemove?.AppName || 'Unknown App';

    const confirmed = window.confirm(
      `Are you sure you want to disconnect "${appName}"? You can reconnect it later if needed.`
    );

    if (!confirmed) return;

    try {
      // Remove app ID from user's myApps array
      const userRef = doc(db, 'User_Profiles', user.uid);
      await updateDoc(userRef, {
        myApps: arrayRemove(appId)
      });

      // Log the event
      await logUserEvent(
        user.uid,
        'app_disconnected',
        `Disconnected app: ${appName}`,
        `App ID: ${appId}`
      );

      // Update local state
      setApps(prev => prev.filter(app => app.id !== appId));

      console.log('App removed successfully:', appId);
    } catch (error) {
      console.error('Error removing app:', error);
      alert('Failed to remove app. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? "text-yellow-400" : "text-gray-500"}>
          {i <= Math.round(rating) ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Please log in to view your apps.</p>
      </div>
    );
  }

  return (
    <main className="flex-grow px-6 py-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Apps</h1>
            <p className="text-gray-400">Manage your connected applications</p>
          </div>
          <button
            onClick={() => router.push('/AllApps')}
            className="px-6 py-3 bg-blue-600/80 hover:bg-blue-700/90 rounded-xl 
                     text-white font-medium transition-all duration-300 
                     shadow-lg hover:shadow-blue-500/50 hover:scale-105"
          >
            Browse Apps
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">No Apps Connected</h2>
          <p className="text-gray-400 mb-6">Start by connecting your first application</p>
          <button
            onClick={() => router.push('/AllApps')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl 
                     font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
          >
            Browse App Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 
                       overflow-hidden hover:border-blue-500/50 transition-all duration-300
                       shadow-lg hover:shadow-blue-500/20"
            >
              {/* App Icon/Header */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center">
                  {app.iconURL ? (
                    <img src={app.iconURL} alt={app.AppName} className="w-16 h-16 object-contain" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {app.AppName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* App Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 truncate">
                  {app.AppName}
                </h3>
                
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {app.Description || 'No description available'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">{renderStars(app.AverageRating || 0)}</div>
                  <span className="text-sm text-gray-400">
                    {(app.AverageRating || 0).toFixed(1)}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {app.Tags?.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {(app.Tags?.length || 0) > 2 && (
                    <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                      +{(app.Tags?.length || 0) - 2}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/app/${encodeURIComponent(app.AppName)}`)}
                    className="flex-1 px-4 py-2 bg-blue-600/80 hover:bg-blue-700 
                             text-white text-sm font-medium rounded-lg 
                             transition-all duration-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleRemoveApp(app.id)}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 
                             text-red-400 text-sm font-medium rounded-lg 
                             transition-all duration-200 border border-red-500/30"
                    title="Disconnect App"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
