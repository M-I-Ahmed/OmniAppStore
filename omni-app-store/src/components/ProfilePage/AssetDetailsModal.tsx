'use client';

import { Asset } from '@/types/asset';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AssetDetailsModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetDetailsModal({ asset, isOpen, onClose }: AssetDetailsModalProps) {
  if (!isOpen || !asset) return null;

  const getHealthStatusColor = () => {
    const status = asset.operational_status?.health_status;
    switch (status) {
      case 'online':
        return 'text-emerald-500';
      case 'warning':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  const getHealthStatusBg = () => {
    const status = asset.operational_status?.health_status;
    switch (status) {
      case 'online':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-6 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {asset.core_identity?.display_name || 'Asset Details'}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getHealthStatusBg()} ${getHealthStatusColor()}`}>
                {asset.operational_status?.health_status || 'unknown'}
              </span>
              <span className="text-slate-400 text-sm">
                {asset.core_identity?.asset_category}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Section - Image and Core Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Section */}
            <div className="lg:col-span-1">
              <div className="w-full aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center p-6 sticky top-24">
                {asset.core_identity?.image_url ? (
                  <img
                    src={asset.core_identity.image_url}
                    alt={asset.core_identity.display_name || 'Asset'}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-8xl">🏭</div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="lg:col-span-2">
              {/* Core Identity */}
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-700/50 h-full">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-blue-400">📋</span>
                  Core Identity
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-slate-400 mb-1">Manufacturer</dt>
                    <dd className="text-sm text-slate-200 font-medium">
                      {asset.core_identity?.manufacturer || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 mb-1">Model Number</dt>
                    <dd className="text-sm text-slate-200 font-medium">
                      {asset.core_identity?.model_number || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 mb-1">Serial Number</dt>
                    <dd className="text-sm text-slate-200 font-mono">
                      {asset.core_identity?.serial_number || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 mb-1">Asset ID</dt>
                    <dd className="text-sm text-slate-200 font-mono truncate">
                      {asset.asset_id}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Full Width Sections Below */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Operational Status */}
            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-green-400">⚡</span>
                Operational Status
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Availability</dt>
                  <dd className="text-sm font-medium">
                    {asset.operational_status?.is_available ? (
                      <span className="text-emerald-400">✓ Available</span>
                    ) : (
                      <span className="text-slate-400">✗ Unavailable</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Health Status</dt>
                  <dd className={`text-sm font-medium ${getHealthStatusColor()}`}>
                    {asset.operational_status?.health_status?.toUpperCase() || 'UNKNOWN'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Location</dt>
                  <dd className="text-sm text-slate-200">
                    {asset.operational_status?.location_area || 'Not specified'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Technical Specifications */}
            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-purple-400">⚙️</span>
                Technical Specs
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Payload Capacity</dt>
                  <dd className="text-sm text-slate-200 font-medium">
                    {asset.technical_specs?.payload_capacity_kg ? 
                      `${asset.technical_specs.payload_capacity_kg} kg` : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Reach Radius</dt>
                  <dd className="text-sm text-slate-200 font-medium">
                    {asset.technical_specs?.reach_radius_mm ? 
                      `${asset.technical_specs.reach_radius_mm} mm` : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Current Configuration */}
            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-amber-400">🔧</span>
                Configuration
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Mounted Tool</dt>
                  <dd className="text-sm text-slate-200">
                    {asset.current_configuration?.mounted_tool_id || 'No tool mounted'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 mb-1">Owner ID</dt>
                  <dd className="text-sm text-slate-200 font-mono truncate">
                    {asset.owner_id}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Supported Protocols - Full Width */}
          {asset.technical_specs?.supported_protocols?.length > 0 && (
            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-cyan-400">🔌</span>
                Supported Protocols
              </h3>
              <div className="flex flex-wrap gap-2">
                {asset.technical_specs.supported_protocols.map((protocol, idx) => (
                  <span 
                    key={idx} 
                    className="text-sm px-3 py-1.5 bg-slate-600/50 text-slate-300 rounded-lg border border-slate-600"
                  >
                    {protocol}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => alert('Edit functionality coming soon!')}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Edit Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
