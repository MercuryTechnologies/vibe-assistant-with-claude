import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ActionToolbar } from './ActionToolbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {!isDashboard && <TopNav />}
        <main className="flex-1">{children}</main>
      </div>
      <ActionToolbar />
    </div>
  );
}
