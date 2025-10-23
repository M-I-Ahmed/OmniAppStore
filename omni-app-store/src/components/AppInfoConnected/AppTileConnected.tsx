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
}

export default function AppTileConnected({ id }: AppTileProps) {
  const router = useRouter();
  const [appName, setAppName] = useState<string | null>(null);
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
          setAppName(data.AppName);
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

  const handleNavigate = () => {
    router.push(`/app/${encodeURIComponent(appName || '')}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center w-72 h-80 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
        <div className="animate-pulse">
          <div className="w-24 h-24 rounded-xl bg-blue-500/20" />
          <div className="h-4 w-32 mt-4 bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center w-72 h-80 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-red-400/50">
        <p className="text-red-400">Error loading app</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-72 h-80 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-white/10 
                    hover:border-blue-400/50 transition-all duration-300 
                    hover:shadow-lg hover:shadow-blue-500/25">
      <div className="w-24 h-24 mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                      flex items-center justify-center">
        <img src="/vercel.svg" alt={appName || ''} className="w-16 h-16" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">{appName}</h3>
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