"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface AppTileProps {
  id: string;
}

interface AppData {
  AppName: string;
  Description: string;
  AverageRating: number;
  ReviewCount: number;
}

export default function AppTileConnected({ id }: AppTileProps) {
  const router = useRouter();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppName = async () => {
      console.log('Starting fetch for app ID:', id);
      console.log('Firebase db instance:', db);

      try {
        console.log('Creating document reference...');
        const docRef = doc(db, 'Apps', id);
        console.log('Document reference created:', docRef);

        console.log('Attempting to fetch document...');
        const appDoc = await getDoc(docRef);
        console.log('Document fetch completed. Exists:', appDoc.exists());
        console.log('Raw document data:', appDoc.data());

        if (appDoc.exists()) {
          const data = appDoc.data() as AppData;
          console.log('Parsed app data:', data);
          console.log('App name found:', data.AppName);
          console.log('App rating:', data.AverageRating);
          setAppData(data);
        } else {
          console.error('Document does not exist for ID:', id);
          setError('App not found');
        }
      } catch (err) {
        console.error('Detailed Firebase error:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          errorStack: err instanceof Error ? err.stack : undefined,
          documentId: id,
          databaseInstance: !!db
        });
        setError('Error loading app');
      } finally {
        setLoading(false);
      }
    };

    fetchAppName();
  }, [id]);

  // Function to render blue stars based on actual rating
  const renderStars = (rating: number) => {
    const stars = [];
    const actualRating = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      if (actualRating >= i) {
        // Filled star - rating is equal to or greater than current star position
        stars.push(
          <span key={i} className="text-blue-400">★</span>
        );
      } else if (actualRating >= i - 0.5) {
        // Half star - for ratings like 3.5, 4.5 etc.
        stars.push(
          <span key={i} className="text-blue-400">★</span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} className="text-gray-500">☆</span>
        );
      }
    }

    return stars;
  };

  const handleNavigate = () => {
    router.push(`/app/${encodeURIComponent(appData?.AppName || '')}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center w-72 h-96 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-white/10 justify-items-center text-center">
        <div className="animate-pulse">
          <div className="w-24 h-24 rounded-xl bg-blue-500/20" />
          <div className="h-4 w-32 mt-4 bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center w-72 h-96 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-red-400/50">
        <p className="text-red-400">Error loading app</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-72 h-96 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-white/10 
                    hover:border-blue-400/50 transition-all duration-300 
                    hover:shadow-lg hover:shadow-blue-500/25
                    justify-items-center text-center">
      <div className="w-24 h-24 mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                      flex items-center justify-center">
        <img src="/vercel.svg" alt={appData?.AppName || ''} className="w-16 h-16" />
      </div>
      
      {/* Fixed height container for app title to ensure alignment */}
      <div className="h-16 flex items-center mb-4">
        <h3 className="text-xl font-semibold text-white text-center line-clamp-2">
          {appData?.AppName}
        </h3>
      </div>
      
      {/* Fixed height container for description to ensure star alignment */}
      <div className="h-12 mb-4 flex items-start">
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 overflow-hidden text-center">
          {appData?.Description || 'No description available'}
        </p>
      </div>
      
      {/* Rating stars aligned to the left - now at same level */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-start gap-1">
          <div className="flex items-center">
            {renderStars(appData?.AverageRating || 0)}
          </div>
          <span className="text-blue-400 text-xs ml-1">
            ({appData?.ReviewCount || 0})
          </span>
        </div>
      </div>
      
      <div className="mt-auto">
        <button
          onClick={handleNavigate}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600/20 text-blue-400 
                    hover:bg-blue-500/30 transition-colors duration-200"
        >
          Find Out More
        </button>
      </div>
    </div>
  );
}