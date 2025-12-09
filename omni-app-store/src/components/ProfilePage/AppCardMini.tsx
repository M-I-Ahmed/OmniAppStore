'use client';

import React from 'react';

interface AppCardMiniProps {
  app: {
    id: string;
    AppName: string;
    iconURL?: string;
    AverageRating: number;
    Price: number;
    Tags: string[];
  };
  onClick?: () => void;
}

export default function AppCardMini({ app, onClick }: AppCardMiniProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? "text-yellow-400 text-xs" : "text-gray-500 text-xs"}>
          {i <= Math.round(rating) ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-slate-700/30 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 
                 transition-all duration-200 cursor-pointer group"
    >
      {/* Icon */}
      <div className="w-full h-24 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-md overflow-hidden mb-3 flex items-center justify-center">
        {app.iconURL ? (
          <img
            src={app.iconURL}
            alt={app.AppName}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ display: app.iconURL ? 'none' : 'flex' }}
        >
          <span className="text-3xl font-bold text-white">
            {app.AppName.charAt(0)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-slate-100 truncate group-hover:text-blue-400 transition-colors">
          {app.AppName}
        </h4>
        
        <div className="flex items-center gap-1">
          {renderStars(app.AverageRating || 0)}
          <span className="text-xs text-slate-400 ml-1">
            {(app.AverageRating || 0).toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded truncate">
            {app.Tags?.[0] || 'App'}
          </span>
          <span className="text-xs font-medium text-emerald-400">
            {(app.Price || 0) === 0 ? 'Free' : `$${app.Price}`}
          </span>
        </div>
      </div>
    </div>
  );
}
