import { cn } from '@/lib/utils';

const shimmerStyle = {
  background: 'linear-gradient(90deg, hsl(40 20% 94%) 0%, hsl(40 15% 90%) 50%, hsl(40 20% 94%) 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-xl bg-card border border-border/60 overflow-hidden', className)}>
      <div
        className="aspect-square"
        style={shimmerStyle}
      />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded" style={{ ...shimmerStyle, animationDelay: '0.1s' }} />
        <div className="h-3 w-1/2 rounded" style={{ ...shimmerStyle, animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  className?: string;
  cols?: '1' | '2' | '3' | '4';
}

export function SkeletonGrid({ count = 6, className = '', cols = '3' }: SkeletonGridProps) {
  const colsClass = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-2 md:grid-cols-4',
  }[cols];

  return (
    <div className={cn('grid gap-4 md:gap-6', colsClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

interface SkeletonRowProps {
  lines?: number;
  className?: string;
}

export function SkeletonRow({ lines = 3, className = '' }: SkeletonRowProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-muted"
          style={{
            width: `${100 - i * 20 - Math.random() * 15}%`,
            background: 'linear-gradient(90deg, hsl(40 20% 94%) 0%, hsl(40 15% 90%) 50%, hsl(40 20% 94%) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonImageProps {
  className?: string;
  aspect?: string;
}

export function SkeletonImage({ className = '', aspect = 'aspect-square' }: SkeletonImageProps) {
  return (
    <div
      className={cn('rounded-lg overflow-hidden', aspect, className)}
      style={shimmerStyle}
    />
  );
}
