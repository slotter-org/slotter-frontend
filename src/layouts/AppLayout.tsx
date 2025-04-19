import React, { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavBar } from '@/components/common/NavBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SideBar } from '@/components/common/SideBar';
import { useAuth } from '@/hooks/useAuth';
import { BottomBar } from '@/components/common/BottomBar';
import { useSidebar } from '@/components/ui/sidebar';
import { AiChatProvider, useAiChat } from '@/contexts/AiChatContext';
import { AiChatBar } from '@/components/common/AiChatForm';

interface AppLayoutProps {
  children?: ReactNode;
}

/**
 * The top-level layout decides:
 *   - If not authenticated, show minimal layout
 *   - If authenticated, wraps everything in <SidebarProvider> and shows the sidebar layout
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const shouldScroll = location.pathname === "/landing";

  // If not authenticated, show a simpler layout
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <NavBar />
        <main className={cn("flex-1", shouldScroll ? "overflow-auto" : "overflow-hidden")}>
          <Outlet />
        </main>
      </div>
    );
  }

  // Otherwise, wrap the "sidebar-based layout" in a <SidebarProvider>
  return (
    <AiChatProvider>
      <SidebarProvider defaultOpen collapsible="offcanvas">
        <AppLayoutWithSidebar shouldScroll={shouldScroll}>
          {children}
        </AppLayoutWithSidebar>
      </SidebarProvider>
    </AiChatProvider>
  );
}

// A separate child component that calls useSidebar()
// because now we are inside <SidebarProvider>.
function AppLayoutWithSidebar({
  children,
  shouldScroll,
}: {
  children?: ReactNode;
  shouldScroll: boolean;
}) {
  const { isOffCanvas, isBelowMd, state } = useSidebar();
  const { isOpen } = useAiChat();
  return (
    <div className="flex h-screen w-screen">
      <SideBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar />
        <main className={cn("flex-1", shouldScroll ? "overflow-auto" : "overflow-hidden")}>
          <Outlet />
          {children}
        </main>
        {/* Only show the bottom bar if "offcanvas" and < md */}
        {(isOffCanvas && isBelowMd) && (
          <BottomBar />
        )}

        {isOpen && <AiChatBar />}
      </div>
    </div>
  );
}

