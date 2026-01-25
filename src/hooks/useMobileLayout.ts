import { create } from 'zustand';
import { useEffect, useCallback } from 'react';

// Mobile breakpoint - 768px
const MOBILE_BREAKPOINT = 768;

interface MobileLayoutState {
  isMobile: boolean;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
}

const useMobileLayoutStore = create<MobileLayoutState>((set) => ({
  isMobile: typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  isSidebarOpen: false,
  
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsMobile: (isMobile: boolean) => set({ isMobile, isSidebarOpen: false }),
}));

/**
 * Hook to manage mobile layout state
 * Handles responsive sidebar behavior and screen size detection
 */
export function useMobileLayout() {
  const state = useMobileLayoutStore();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (isMobile !== state.isMobile) {
        state.setIsMobile(isMobile);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isMobile, state.setIsMobile]);
  
  // Close sidebar on route change (mobile only)
  const closeSidebarOnNavigation = useCallback(() => {
    if (state.isMobile && state.isSidebarOpen) {
      state.closeSidebar();
    }
  }, [state.isMobile, state.isSidebarOpen, state.closeSidebar]);
  
  return {
    isMobile: state.isMobile,
    isSidebarOpen: state.isSidebarOpen,
    openSidebar: state.openSidebar,
    closeSidebar: state.closeSidebar,
    toggleSidebar: state.toggleSidebar,
    closeSidebarOnNavigation,
  };
}

// Export the store for direct access if needed
export { useMobileLayoutStore };
