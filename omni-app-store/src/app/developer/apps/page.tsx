"use client";

import DeveloperSideNav from '@/components/developer/DeveloperSideNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface App {
  id: string;
  AppName: string;
  AppDescription: string;
  AppCategory: string;
  AppPrice: number;
  downloads?: number;
  rating?: number;
  status?: 'published' | 'draft' | 'under_review';
  createdAt?: any;
}

export default function MyPublishedApps() {
  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isDeveloper || userProfile.developerStatus !== 'verified')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (user && userProfile?.isDeveloper) {
      fetchMyApps();
    }
  }, [user, userProfile]);

  const fetchMyApps = async () => {
    if (!user) return;

    setLoadingApps(true);
    try {
      const appsQuery = query(
        collection(db, 'Apps'),
        where('developerId', '==', user.uid)
      );
      const appsSnapshot = await getDocs(appsQuery);
      
      const myApps = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as App[];

      setApps(myApps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      showToast('Failed to load your apps', 'error');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleDeleteApp = async (appId: string, appName: string) => {
    if (!confirm(`Are you sure you want to delete "${appName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingAppId(appId);
    try {
      await deleteDoc(doc(db, 'Apps', appId));
      setApps(apps.filter(app => app.id !== appId));
      showToast('App deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting app:', error);
      showToast('Failed to delete app', 'error');
    } finally {
      setDeletingAppId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Published</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">Draft</span>;
      case 'under_review':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">Under Review</span>;
      default:
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Published</span>;
    }
  };

  if (loading || loadingApps) {
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
            <h1 className="text-4xl font-bold text-white mb-2">
              My Published Apps
            </h1>
            <p className="text-gray-400">Manage your published applications</p>
          </div>
          <button
            onClick={() => router.push('/developer/upload')}
            className="px-6 py-3 bg-blue-600/80 hover:bg-blue-700/90 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload New App
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">{apps.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Apps</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-green-500/20 p-6 shadow-lg shadow-green-500/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">{apps.filter(a => a.status === 'published' || !a.status).length}</span>
            </div>
            <p className="text-slate-400 text-sm">Published</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-yellow-500/20 p-6 shadow-lg shadow-yellow-500/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">{apps.filter(a => a.status === 'under_review').length}</span>
            </div>
            <p className="text-slate-400 text-sm">Under Review</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-gray-500/20 p-6 shadow-lg shadow-gray-500/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">{apps.filter(a => a.status === 'draft').length}</span>
            </div>
            <p className="text-slate-400 text-sm">Drafts</p>
          </div>
        </div>

        {/* Apps List */}
        {apps.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-12 shadow-lg text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Apps Published Yet</h3>
            <p className="text-slate-400 mb-6">Start by uploading your first application</p>
            <button
              onClick={() => router.push('/developer/upload')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
            >
              Upload Your First App
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6 shadow-lg hover:shadow-cyan-500/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{app.AppName}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">{app.AppDescription}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">
                        Category: <span className="text-slate-300">{app.AppCategory || 'Uncategorized'}</span>
                      </span>
                      <span className="text-slate-500">
                        Price: <span className="text-green-400">${app.AppPrice || 0}</span>
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex items-center gap-6 mb-4 py-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-slate-300 text-sm">{app.downloads || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-slate-300 text-sm">{app.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/developer/apps/${app.id}/edit`)}
                    className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/app/${encodeURIComponent(app.AppName)}`)}
                    className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-all font-medium text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteApp(app.id, app.AppName)}
                    disabled={deletingAppId === app.id}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all font-medium text-sm disabled:opacity-50"
                  >
                    {deletingAppId === app.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeveloperSideNav>
  );
}
