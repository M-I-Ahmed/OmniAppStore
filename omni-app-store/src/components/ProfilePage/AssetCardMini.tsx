'use client';

import React from 'react';
import { Asset } from '@/types/asset';

interface AssetCardMiniProps {
  asset: Asset;
}

export default function AssetCardMini({ asset }: AssetCardMiniProps) {
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
    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-all duration-200">
      {/* Image */}
      <div className="w-full h-24 bg-white rounded-md overflow-hidden mb-3 flex items-center justify-center p-2">
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
          className="w-full h-full flex items-center justify-center text-4xl"
          style={{ display: asset.core_identity?.image_url ? 'none' : 'flex' }}
        >
          🏭
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-slate-100 truncate flex-1">
            {asset.core_identity?.display_name || 'Unnamed Asset'}
          </h4>
          <div 
            className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${getHealthStatusColor()}`}
            title={`Status: ${asset.operational_status?.health_status || 'unknown'}`}
          />
        </div>
        
        <p className="text-xs text-slate-400 truncate">
          {asset.core_identity?.manufacturer || 'Unknown'}
        </p>

        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded truncate">
            {asset.core_identity?.asset_category || 'uncategorized'}
          </span>
          {asset.operational_status?.is_available ? (
            <span className="text-xs text-emerald-400">✓</span>
          ) : (
            <span className="text-xs text-slate-500">✗</span>
          )}
        </div>
      </div>
    </div>
  );
}
