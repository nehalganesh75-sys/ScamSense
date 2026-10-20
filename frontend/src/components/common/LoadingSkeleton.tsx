import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-8 bg-slate-800/80 rounded-md w-1/3"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-850 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};
