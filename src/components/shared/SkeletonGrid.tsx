// ==================== Shared Skeleton Grid Component ====================

'use client'

interface SkeletonGridProps {
  count?: number
  aspectRatio?: string
  variant?: 'shimmer' | 'pulse'
}

export function SkeletonGrid({ count = 6, aspectRatio = '2/3', variant = 'shimmer' }: SkeletonGridProps) {
  const baseClass =
    variant === 'shimmer'
      ? 'aspect-[var(--aspect)] rounded-xl skeleton-shimmer'
      : 'aspect-[var(--aspect)] rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse'

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5"
      style={{ '--aspect': aspectRatio } as React.CSSProperties}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={baseClass} />
      ))}
    </div>
  )
}
