import React, { ReactNode } from 'react';
import { ViewportProvider } from '@/contexts/ViewportProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import { MeProvider } from '@/contexts/MeProvider';
import { WebSocketProvider} from '@/contexts/WebSocketProvider';
import { SearchProvider } from '@/contexts/SearchProvider';
import { AppRouter } from '@/router/AppRouter';
import { useAuth } from '@/hooks/useAuth';

function MaybeMeProvider ({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  return <MeProvider>{children}</MeProvider>;
}

export default function App() {
  return (
    <ViewportProvider>
      <ThemeProvider>
        <AuthProvider>
          <MaybeMeProvider>
            <WebSocketProvider>
              <SearchProvider>
                <AppRouter />
              </SearchProvider>
            </WebSocketProvider>
          </MaybeMeProvider>
        </AuthProvider>
      </ThemeProvider>
    </ViewportProvider>
  );
}
