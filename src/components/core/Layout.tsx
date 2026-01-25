import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ActionToolbar } from './ActionToolbar';
import { useMobileLayout } from '@/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@/icons';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isMobile, toggleSidebar } = useMobileLayout();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  
  return (
    <div className={cn('flex min-h-screen bg-background', isMobile && 'flex-col')}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Hamburger */}
        {isMobile && (
          <header className="ds-mobile-header">
            <button 
              className="ds-mobile-hamburger"
              onClick={toggleSidebar}
              aria-label="Open navigation menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="ds-mobile-header-logo">
              <img src="/logo.svg" alt="Maker Inc." className="ds-mobile-logo-img" />
              <span className="ds-mobile-company-name">Maker Inc.</span>
            </div>
            <div className="ds-mobile-header-spacer" />
          </header>
        )}
        {!isDashboard && !isMobile && <TopNav />}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
      <ActionToolbar />
    </div>
  );
}
