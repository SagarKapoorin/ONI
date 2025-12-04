interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${
        className ?? ""
      }`}
    />
  );
};
