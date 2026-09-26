// Skeleton loader components for loading states
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`pp-card p-6 ${className}`}>
      <div className="pp-skeleton h-4 w-32 mb-3" />
      <div className="pp-skeleton h-8 w-20 mb-2" />
      <div className="pp-skeleton h-3 w-24" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="pp-skeleton w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="pp-skeleton h-3 w-3/4" />
        <div className="pp-skeleton h-2 w-1/2" />
      </div>
      <div className="pp-skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="pp-skeleton rounded-xl" style={{ height }} />
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 pp-card p-6">
          <div className="pp-skeleton h-4 w-40 mb-4" />
          <SkeletonChart height={240} />
        </div>
        <div className="pp-card p-6">
          <div className="pp-skeleton h-4 w-32 mb-4" />
          {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    </div>
  );
}
