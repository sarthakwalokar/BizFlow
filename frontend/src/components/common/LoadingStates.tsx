import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Small spinner inside buttons during active API requests.
 */
export const ButtonSpinner: React.FC<{ 
  text?: string; 
  className?: string; 
  spinnerColor?: string;
  size?: 'xs' | 'sm' | 'md';
}> = ({ 
  text, 
  className,
  spinnerColor,
  size = 'sm'
}) => {
  const sizeClass = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  const colorClass = spinnerColor || 'text-current';
  const finalClass = className || `${sizeClass} ${colorClass} animate-spin`;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Loader2 className={finalClass} />
      {text && <span>{text}</span>}
    </span>
  );
};

/**
 * Basic animated skeleton block with neutral palette (#E4E4E7).
 */
export const SkeletonBlock: React.FC<{ 
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "h-4 w-full", style }) => (
  <div style={style} className={`animate-pulse bg-zinc-200 rounded-md ${className}`} />
);

/**
 * Metric/KPI card skeleton grid for Dashboard and Analytics.
 */
export const MetricCardsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-3.5 w-24" />
          <SkeletonBlock className="w-8 h-8 rounded-lg" />
        </div>
        <SkeletonBlock className="h-7 w-32 rounded-lg" />
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-14" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Table skeleton loader for products, customers, expenses, orders, inventory.
 */
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  cols?: number;
}> = ({ 
  rows = 5, 
  columns,
  cols
}) => {
  const effectiveCols = cols || columns || 5;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-card">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-4">
        <SkeletonBlock className="h-9 w-64 rounded-xl" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-9 w-24 rounded-xl" />
          <SkeletonBlock className="h-9 w-28 rounded-xl" />
        </div>
      </div>
      <div className="divide-y divide-zinc-100">
        <div className="bg-zinc-50 px-4 py-3 flex items-center justify-between gap-4">
          {Array.from({ length: effectiveCols }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3.5 w-20" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex items-center justify-between gap-4">
            {Array.from({ length: effectiveCols }).map((_, c) => (
              <SkeletonBlock 
                key={c} 
                className={`h-4 ${c === 0 ? 'w-36' : c === effectiveCols - 1 ? 'w-16' : 'w-24'}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Chart skeleton for Analytics & Reports.
 */
export const ChartSkeleton: React.FC<{ title?: string; height?: string }> = ({ 
  title, 
  height = "h-56" 
}) => (
  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        {title ? (
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
        ) : (
          <SkeletonBlock className="h-4 w-32" />
        )}
        <SkeletonBlock className="h-3 w-48" />
      </div>
      <SkeletonBlock className="h-6 w-20 rounded-lg" />
    </div>
    <div className={`${height} flex items-end justify-between gap-2 pt-6 px-2`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <SkeletonBlock 
            className="w-full rounded-t-md" 
            style={{ height: `${30 + (i * 9) % 65}%` }}
          />
          <SkeletonBlock className="h-2.5 w-8" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * POS Product Grid Skeleton.
 */
export const PosGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 rounded-xl bg-white border border-zinc-200 shadow-card space-y-2.5">
        <div className="flex items-start justify-between">
          <SkeletonBlock className="w-8 h-8 rounded-lg" />
          <SkeletonBlock className="w-12 h-4 rounded-md" />
        </div>
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="w-6 h-6 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * AI Thinking / Analyzing Indicator.
 */
export const AiAnalyzingIndicator: React.FC<{ message?: string }> = ({ 
  message = "Analyzing your business data..." 
}) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-50/70 border border-brand-100 max-w-lg">
    <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
      <Sparkles className="w-4 h-4 animate-spin text-brand-100" />
    </div>
    <div className="space-y-1.5 flex-1">
      <p className="text-xs font-semibold text-brand-900">{message}</p>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

/**
 * Full page loading state for initial app authorization bootstrap.
 */
export const FullPageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading BizFlow workspace..." 
}) => (
  <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
    <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-card flex flex-col items-center space-y-4 max-w-xs w-full text-center">
      <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-950">BizFlow</p>
        <p className="text-xs text-zinc-500 mt-1">{message}</p>
      </div>
    </div>
  </div>
);
