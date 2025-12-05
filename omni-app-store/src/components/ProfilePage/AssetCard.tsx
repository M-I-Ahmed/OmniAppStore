'use client';

import React, { useState } from 'react';
import { Asset } from '@/types/asset';

interface AssetCardProps {
  asset: Asset;
  onToggleAvailability?: (assetId: string, isAvailable: boolean) => void;
}

export default function AssetCard({ asset, onToggleAvailability }: AssetCardProps) {
  const [isAvailable, setIsAvailable] = useState(asset.operational_status?.is_available ?? true);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
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
    <div className="w-[280px] bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-200 shadow-lg">
      <div className="flex gap-3">
        {/* Asset Image */}
        <div className="w-16 h-16 bg-slate-700 rounded-md overflow-hidden flex-shrink-0">
          {asset.core_identity?.image_url ? (
            <img
              src={asset.core_identity.image_url}
              alt={asset.core_identity.display_name || 'Asset'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ display: asset.core_identity?.image_url ? 'none' : 'flex' }}
          >
            🏭
          </div>
        </div>

        {/* Asset Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-100 truncate">
              {asset.core_identity?.display_name || 'Unnamed Asset'}
            </h3>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${getHealthStatusColor()}`} />
          </div>
          
          <p className="text-sm text-slate-400 truncate mb-2">
            {asset.core_identity?.manufacturer || 'Unknown Manufacturer'}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
              {asset.core_identity?.asset_category || 'uncategorized'}
            </span>
            {asset.core_identity?.model_number && (
              <span className="text-xs text-slate-500 truncate">
                {asset.core_identity.model_number}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Location & Availability */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {asset.operational_status?.location_area || 'Location TBD'}
            </span>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-600'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isAvailable ? 'Available' : 'Unavailable'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}