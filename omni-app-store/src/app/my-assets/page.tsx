'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AssetCard from '@/components/ProfilePage/AssetCard';
import AddAssetModal from '@/components/ProfilePage/AddAssetModal';
import { Asset } from '@/types/asset';

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
      const userProfilesRef = collection(db, 'User_Profiles');
      const userProfilesSnapshot = await getDocs(userProfilesRef);
      const userProfile = userProfilesSnapshot.docs.find(d => d.id === user.uid)?.data();
      const userAssetIds = userProfile?.myAssets || [];

      if (userAssetIds.length === 0) {
        setAssets([]);
        setIsLoading(false);
        return;
      }

      // Fetch all assets from the Assets collection
      const assetsRef = collection(db, 'Assets');
      const assetsSnapshot = await getDocs(assetsRef);
      
      // Filter to only include user's assets
      const userAssets = assetsSnapshot.docs
        .filter(doc => userAssetIds.includes(doc.id))
        .map(doc => ({
          asset_id: doc.id,
          ...doc.data()
        })) as Asset[];

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
      case 'end_effector':
      case 'cnc':
      case 'plc_controller':
        return assets.filter(asset => asset.core_identity.asset_category === activeFilter);
      case 'available':
        return assets.filter(asset => asset.operational_status.is_available);
      case 'all':
      default:
        return assets;
    }
  }, [assets, activeFilter]);

  // Handle toggle callback from AssetCard
  const handleToggleAvailability = async (assetId: string, isAvailable: boolean) => {
    try {
      // Update in Firestore
      const assetRef = doc(db, 'Assets', assetId);
      await updateDoc(assetRef, {
        'operational_status.is_available': isAvailable
      });

      // Update local state
      setAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.asset_id === assetId
            ? {
                ...asset,
                operational_status: {
                  ...asset.operational_status,
                  is_available: isAvailable
                }
              }
            : asset
        )
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update asset status. Please try again.');
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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-slate-400">Please log in to view your assets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">My Shop Floor</h1>
            <p className="text-slate-400">
              Manage your industrial equipment and digital twins
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Asset
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your assets...</p>
          </div>
        ) : assets.length === 0 ? (
          /* Empty State - No Assets Yet */
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🏭</div>
            <h2 className="text-2xl font-bold text-slate-200 mb-3">No Assets Yet</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Start building your digital shop floor by adding your first piece of equipment
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            >
              Add Your First Asset
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
              {filters.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    activeFilter === filter.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Total Assets</p>
                <p className="text-2xl font-bold text-slate-100">{assets.length}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Available</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {assets.filter(a => a.operational_status.is_available).length}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">In Maintenance</p>
                <p className="text-2xl font-bold text-amber-400">
                  {assets.filter(a => !a.operational_status.is_available).length}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Health Issues</p>
                <p className="text-2xl font-bold text-red-400">
                  {assets.filter(a => a.operational_status.health_status === 'error').length}
                </p>
              </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <AssetCard
                  key={asset.asset_id}
                  asset={asset}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>

            {/* Filtered Empty State */}
            {filteredAssets.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No assets found</h3>
                <p className="text-slate-500">Try adjusting your filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssetAdded={fetchUserAssets}
      />
    </div>
  );
}