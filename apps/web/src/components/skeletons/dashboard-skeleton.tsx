'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-1 h-8 w-48" />
          <Skeleton className="mb-5 h-4 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        <div className="mb-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Concept Tree */}
          <div className="space-y-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="ml-auto h-5 w-12 rounded-full" />
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3">
                      <Skeleton className="h-9 w-9 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
