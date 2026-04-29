import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <Skeleton className="h-1 w-full" />
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-7 w-7 rounded" />
              </div>
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <div className="space-y-1 text-center">
                <Skeleton className="h-4 w-36 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto rounded-full" />
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
