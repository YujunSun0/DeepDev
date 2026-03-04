'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DomainTabs } from '@/components/domain-tabs';

export function SessionSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Skeleton className="mb-1 h-8 w-32" />
          <Skeleton className="mb-5 h-4 w-80" />
          <DomainTabs activeId="javascript" onChange={() => {}} />
        </div>

        <div className="mb-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        <div className="space-y-10">
          {[1, 2, 3].map((level) => (
            <div key={level}>
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-3xl bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-start justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-40" />
                    <Skeleton className="h-10 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
