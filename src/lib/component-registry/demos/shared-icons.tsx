import { cn } from '@/lib/utils';

export function CircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-3 h-3", className)}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-3 h-3", className)}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="2" cy="6" r="1.5" fill="currentColor" />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      <circle cx="10" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}
