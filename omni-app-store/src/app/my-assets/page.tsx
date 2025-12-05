'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asset } from '@/types/asset';
import AssetCard from '@/components/ProfilePage/AssetCard';
import AddAssetModal from '@/components/ProfilePage/AddAssetModal';

type FilterType = 'all' | 'manipulator' | 'end_effector' | 'cnc' | 'plc_controller' | 'available';

export default function AssetRepositoryPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserAssets();
    }
  }, [user]);

  const fetchUserAssets = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get user's asset IDs from their profile
      const userRef = doc(db, 'User_Profiles', user.uid);
      const userDocSnap = await getDoc(userRef);
      
      if (!userDocSnap.exists()) {
        console.log('User profile not found');
        setAssets([]);
        setIsLoading(false);
        return;
      }

      const userProfile = userDocSnap.data();
      const userAssetIds = userProfile?.myAssets || [];

      console.log('User asset IDs:', userAssetIds);

      if (userAssetIds.length === 0) {
        console.log('No assets linked to user');
        setAssets([]);
        setIsLoading(false);
        return;
      }

      // Fetch all assets from the Assets collection
      const assetsRef = collection(db, 'Assets');
      const assetsSnapshot = await getDocs(assetsRef);
      
      console.log('Total assets in database:', assetsSnapshot.docs.length);

      // Filter to only include user's assets
      const userAssets = assetsSnapshot.docs
        .filter(doc => userAssetIds.includes(doc.id))
        .map(doc => ({
          asset_id: doc.id,
          ...doc.data()
        })) as Asset[];

      console.log('User assets found:', userAssets.length);
      console.log('User assets:', userAssets);

      setAssets(userAssets);
    } catch (error) {
      console.error('Error fetching user assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredAssets = useMemo(() => {
    switch (activeFilter) {
      case 'manipulator':
        return assets.filter(a => a.core_identity?.asset_category === 'manipulator');
      case 'end_effector':
        return assets.filter(a => a.core_identity?.asset_category === 'end_effector');
      case 'cnc':
        return assets.filter(a => a.core_identity?.asset_category === 'cnc');
      case 'plc_controller':
        return assets.filter(a => a.core_identity?.asset_category === 'plc_controller');
      case 'available':
        return assets.filter(a => a.operational_status?.is_available === true);
      default:
        return assets;
    }
  }, [assets, activeFilter]);

  // Handle toggle callback from AssetCard
  const handleToggleAvailability = async (assetId: string, isAvailable: boolean) => {
    try {
      const assetRef = doc(db, 'Assets', assetId);
      await updateDoc(assetRef, {
        'operational_status.is_available': isAvailable
      });
      
      // Update local state
      setAssets(prev => prev.map(asset =>
        asset.asset_id === assetId
          ? {
              ...asset,
              operational_status: {
                ...asset.operational_status,
                is_available: isAvailable
              }
            }
          : asset
      ));
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All Assets', icon: '🏭' },
    { key: 'manipulator', label: 'Robots', icon: '🦾' },
    { key: 'cnc', label: 'CNC', icon: '⚙️' },
    { key: 'end_effector', label: 'End Effectors', icon: '🔧' },
    { key: 'plc_controller', label: 'Controllers', icon: '🎛️' },
    { key: 'available', label: 'Available Only', icon: '✅' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Authentication Required</h2>
          <p className="text-slate-400">Please sign in to view your assets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Asset Repository</h1>
              <p className="text-slate-400">
                Manage and monitor your shop floor equipment
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Asset
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                {activeFilter === filter.key && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-500 text-xs rounded-full">
                    {filteredAssets.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-2">No Assets Yet</h3>
            <p className="text-slate-400 mb-6">
              Start building your digital shop floor by adding your first asset
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Your First Asset
            </button>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-2">No Matches Found</h3>
            <p className="text-slate-400">
              Try a different filter or add more assets
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-slate-400">
                Showing {filteredAssets.length} of {assets.length} assets
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.asset_id}
                  asset={asset}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssetAdded={fetchUserAssets}
      />
    </div>
  );
}