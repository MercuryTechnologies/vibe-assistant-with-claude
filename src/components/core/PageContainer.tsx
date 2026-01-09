import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function PageContainer({ children, fullWidth = false, className = '' }: PageContainerProps) {
  if (fullWidth) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("max-w-4xl mx-auto px-4", className)}>
      {children}
    </div>
  );
}
