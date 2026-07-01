/**
 * Skeleton Components
 * Premium loading states with shimmer animations
 */

import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  animate?: boolean;
}

export function Skeleton({ className, variant = 'text', animate = true }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'h-10 w-10 rounded-full',
    rectangular: 'h-32 w-full rounded-xl',
    card: 'h-64 w-full rounded-2xl',
  };

  return (
    <div 
      className={cn(
        'bg-gray-200 dark:bg-gray-800',
        animate && 'skeleton-shimmer',
        variants[variant], 
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function CollegeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-44 w-full rounded-none" />
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="w-3/4 h-5" />
          <Skeleton className="w-1/2 h-3" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-6 rounded-lg" />
          <Skeleton className="w-20 h-4" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-20 h-5 rounded-full" />
          <Skeleton className="w-14 h-5 rounded-full" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-16 h-5" />
          </div>
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CollegeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <Skeleton className="w-8 h-4" />
        <Skeleton className="flex-1 h-4" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <Skeleton className="w-10 h-10 rounded-xl mb-4" />
            <Skeleton className="w-16 h-8 mb-2" />
            <Skeleton className="w-24 h-4" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Skeleton className="w-32 h-5 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Skeleton className="w-24 h-5 mb-6" />
          <Skeleton className="h-48 w-48 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-md">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}
