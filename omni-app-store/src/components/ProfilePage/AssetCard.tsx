'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Asset } from '@/types/asset';

interface AssetCardProps {
  asset: Asset;
  onToggleAvailability?: (assetId: string, isAvailable: boolean) => void;
}

export default function AssetCard({ asset, onToggleAvailability }: AssetCardProps) {
  const [isAvailable, setIsAvailable] = useState(asset.operational_status.is_available);
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
    switch (asset.operational_status.health_status) {
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
        {/* Thumbnail */}
        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-slate-700 flex-shrink-0">
          <Image
            src={asset.core_identity.image_url}
            alt={asset.core_identity.display_name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Status Dot */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-100 truncate">
              {asset.core_identity.display_name}
            </h3>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${getHealthStatusColor()}`} />
          </div>

          {/* Model & Manufacturer */}
          <p className="text-xs text-slate-400 mb-1 truncate">
            {asset.core_identity.manufacturer} {asset.core_identity.model_number}
          </p>

          {/* Category Badge */}
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded mb-3">
            {asset.core_identity.asset_category}
          </span>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isAvailable ? 'Available' : 'Maintenance'}
            </span>
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                isAvailable ? 'bg-blue-600' : 'bg-slate-600'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Toggle availability"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                  isAvailable ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Location */}
          <p className="text-xs text-slate-500 mt-2 truncate">
            📍 {asset.operational_status.location_area}
          </p>
        </div>
      </div>
    </div>
  );
}