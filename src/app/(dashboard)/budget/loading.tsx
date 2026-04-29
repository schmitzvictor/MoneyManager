import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Month selector + summary cards */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>

      {/* Budget table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex gap-4 px-4 py-3 border-b bg-muted/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: i === 0 ? '100%' : '80px' }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
            <div className="flex-1 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
