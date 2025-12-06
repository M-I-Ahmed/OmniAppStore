'use client';

import React, { useState } from 'react';
import { Asset } from '@/types/asset';
import AssetDetailsModal from './AssetDetailsModal';

interface AssetCardProps {
  asset: Asset;
  onToggleAvailability?: (assetId: string, isAvailable: boolean) => void;
  onRemove?: () => void;
}

export default function AssetCard({ asset, onToggleAvailability, onRemove }: AssetCardProps) {
  const [isAvailable, setIsAvailable] = useState(asset.operational_status?.is_available ?? true);
  const [isToggling, setIsToggling] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsToggling(true);
    const newState = !isAvailable;
    
    // Optimistic UI update
    setIsAvailable(newState);
    
    // Fire callback
    if (onToggleAvailability) {
      await onToggleAvailability(asset.asset_id, newState);
    }
    
    setIsToggling(false);
  };

  const handleCardClick = () => {
    setShowDetailsModal(true);
  };

  const getHealthStatusColor = () => {
    const status = asset.operational_status?.health_status;
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:shadow-xl transition-all duration-200 shadow-lg relative cursor-pointer"
      >
        {/* 3-Dot Menu Button */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 hover:bg-slate-700 rounded-md transition-colors bg-slate-800/80 backdrop-blur-sm"
            aria-label="Asset options"
          >
          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop to close menu when clicking outside */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            <div className="absolute right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  alert('Edit functionality coming soon!');
                }}
                className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-600 rounded-t-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm">Edit Details</span>
              </button>
              
              <div className="border-t border-slate-600" />
              
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onRemove) onRemove();
                }}
                className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 rounded-b-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm font-medium">Remove Asset</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Asset Image */}
      <div className="w-full h-40 bg-white rounded-lg overflow-hidden mb-4 flex items-center justify-center p-4 relative z-10">
        {asset.core_identity?.image_url ? (
          <img
            src={asset.core_identity.image_url}
            alt={asset.core_identity.display_name || 'Asset'}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center text-6xl"
          style={{ display: asset.core_identity?.image_url ? 'none' : 'flex' }}
        >
          🏭
        </div>
      </div>

      {/* Asset Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-100 truncate mb-1">
              {asset.core_identity?.display_name || 'Unnamed Asset'}
            </h3>
            <p className="text-sm text-slate-400 truncate">
              {asset.core_identity?.manufacturer || 'Unknown Manufacturer'}
            </p>
          </div>
          <div 
            className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${getHealthStatusColor()}`}
            title={`Status: ${asset.operational_status?.health_status || 'unknown'}`}
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 bg-slate-700/80 text-slate-300 rounded-md">
            {asset.core_identity?.asset_category || 'uncategorized'}
          </span>
          {asset.core_identity?.model_number && (
            <span className="text-xs px-2.5 py-1 bg-slate-700/50 text-slate-400 rounded-md truncate">
              {asset.core_identity.model_number}
            </span>
          )}
        </div>

        {/* Availability Toggle */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-slate-300">
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <span className="text-xs text-slate-500 leading-none">
                {isAvailable ? '(Ready for tasks)' : '(In use or offline)'}
              </span>
            </div>
            
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                isAvailable ? 'bg-emerald-500' : 'bg-slate-600'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isAvailable ? 'Click to mark as unavailable' : 'Click to mark as available'}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <AssetDetailsModal 
      asset={asset}
      isOpen={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
    />
  </>
  );
}