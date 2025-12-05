'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asset } from '@/types/asset';
import { useAuth } from '@/contexts/AuthContext';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded?: () => void;
}

type Step = 'upload' | 'select' | 'manual';

export default function AddAssetModal({ isOpen, onClose, onAssetAdded }: AddAssetModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchAssets();
    }
  }, [isOpen, user]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      
      // Fetch ALL assets from Assets collection
      const assetsRef = collection(db, 'Assets');
      const assetsSnapshot = await getDocs(assetsRef);
      const assets = assetsSnapshot.docs.map(doc => ({
        asset_id: doc.id,
        ...doc.data()
      })) as Asset[];

      console.log('All assets fetched:', assets.length);
      if (assets.length > 0) {
        console.log('Sample asset:', assets[0]);
        console.log('Sample image URL:', assets[0].core_identity?.image_url);
      }

      setAllAssets(assets);
      
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!selectedAssetId || !user) return;

    try {
      setIsLoading(true);
      
      // Update user's myAssets array in Firestore
      const userRef = doc(db, 'User_Profiles', user.uid);
      await updateDoc(userRef, {
        myAssets: arrayUnion(selectedAssetId)
      });

      console.log('Asset added successfully:', selectedAssetId);

      // Success callback
      if (onAssetAdded) {
        onAssetAdded();
      }

      // Reset and close
      setSelectedAssetId('');
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setCurrentStep('manual');
  };

  const filteredAssets = allAssets.filter(asset => {
    const query = searchQuery.toLowerCase();
    const displayName = asset.core_identity?.display_name?.toLowerCase() || '';
    const manufacturer = asset.core_identity?.manufacturer?.toLowerCase() || '';
    const modelNumber = asset.core_identity?.model_number?.toLowerCase() || '';
    const category = asset.core_identity?.asset_category?.toLowerCase() || '';
    
    return displayName.includes(query) || 
           manufacturer.includes(query) || 
           modelNumber.includes(query) ||
           category.includes(query);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Add Asset to Your Shop Floor</h2>
            <p className="text-slate-400 text-sm mt-1">
              Browse the global asset repository and link equipment to your profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setCurrentStep('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 'upload'
                ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🤖 AI Upload
          </button>
          <button
            onClick={() => setCurrentStep('select')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 'select'
                ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Select Existing
          </button>
          <button
            onClick={() => setCurrentStep('manual')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 'manual'
                ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✏️ Manual Entry
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: AI Upload */}
          {currentStep === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                Smart Upload - AI Powered
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Drag & drop a datasheet (PDF), photo, or specification document.
                Our AI will automatically extract and fill in the asset details.
              </p>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Browse Files
              </button>
              <p className="text-xs text-slate-500 mt-4">
                Supports: PDF, JPG, PNG, CSV (Coming Soon)
              </p>
            </div>
          )}

          {/* Step 2: Select Existing Asset */}
          {currentStep === 'select' && (
            <div>
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by name, manufacturer, model, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Showing {filteredAssets.length} of {allAssets.length} total assets in repository
                </p>
              </div>

              {/* Asset Grid */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading asset repository...</p>
                </div>
              ) : allAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">No assets in repository</h3>
                  <p className="text-slate-400">The global asset repository is empty</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">No matches found</h3>
                  <p className="text-slate-400">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredAssets.map((asset) => (
                    <button
                      key={asset.asset_id}
                      onClick={() => setSelectedAssetId(asset.asset_id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedAssetId === asset.asset_id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-700/50'
                      }`}
                    >
                      {/* Image Container - Smaller */}
                      <div className="w-full aspect-square bg-slate-600 rounded-md overflow-hidden mb-2 relative">
                        {asset.core_identity?.image_url ? (
                          <img
                            src={asset.core_identity.image_url}
                            alt={asset.core_identity.display_name || 'Asset'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', asset.core_identity.image_url);
                              console.error('Asset ID:', asset.asset_id);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback icon */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-slate-400 text-3xl"
                          style={{ display: asset.core_identity?.image_url ? 'none' : 'flex' }}
                        >
                          🏭
                        </div>
                        
                        {/* Selected Indicator - Smaller */}
                        {selectedAssetId === asset.asset_id && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-5 h-5 text-blue-500 bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Asset Details - Compact */}
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm mb-0.5 line-clamp-1">
                          {asset.core_identity?.display_name || 'Unnamed Asset'}
                        </h4>
                        <p className="text-xs text-slate-400 mb-1.5 line-clamp-1">
                          {asset.core_identity?.manufacturer || 'Unknown'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs px-1.5 py-0.5 bg-slate-600 text-slate-300 rounded">
                            {asset.core_identity?.asset_category || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Manual Entry (Placeholder) */}
          {currentStep === 'manual' && (
            <div className="space-y-6">
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🚧</div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Manual Entry Form</h3>
                <p className="text-slate-400 text-sm">
                  This feature will allow you to manually create a new asset digital twin.
                  <br />Coming in the next iteration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-300 hover:text-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddAsset}
            disabled={!selectedAssetId || isLoading}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              selectedAssetId && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Adding...' : 'Add to My Shop Floor'}
          </button>
        </div>
      </div>
    </div>
  );
}