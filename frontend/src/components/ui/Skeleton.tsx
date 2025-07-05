import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div
    className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-700 rounded ${className}`}
    style={style}
  >
    <span className="absolute inset-0 animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60" />
  </div>
);

export default Skeleton; 