'use client';

import { useEffect, useState } from 'react';
import AppTile from './AppTile';
import { getRecentlyAddedApps, AppCollection } from '@/lib/appCollections';

export default function RecentlyAddedApps() {
  const [apps, setApps] = useState<AppCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const recentApps = await getRecentlyAddedApps(10);
        setApps(recentApps);
      } catch (error) {
        console.error('Error loading recently added apps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-16">
        <h2 className="text-2xl font-semibold text-white mb-6 px-8">Recently Added</h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (apps.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-16">
      <h2 className="text-2xl font-semibold text-white mb-6 px-8">Recently Added</h2>
      <div className="relative">
        <div className="overflow-x-scroll scroll-hide scrollbar-hide">
          <div className="flex pb-6 px-8" style={{ width: 'max-content' }}>
            {apps.map((app) => (
              <AppTile 
                key={app.id} 
                id={app.id} 
                name={app.AppName} 
                icon={app.iconURL || '/vercel.svg'} 
              />
            ))}
          </div>
        </div>
        {/* Gradient fades at the edges */}
        <div className="absolute top-0 right-0 h-full w-24 
                      bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 h-full w-24 
                      bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}