import React, { ReactNode } from 'react';
import { ViewportProvider } from '@/contexts/ViewportProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import { MeProvider } from '@/contexts/MeProvider';
import { MyEntityProvider } from '@/contexts/MyEntityProvider';
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
          <WebSocketProvider>
            <MaybeMeProvider>
              <MyEntityProvider>
                <SearchProvider>
                  <AppRouter />
                </SearchProvider>
              </MyEntityProvider>
            </MaybeMeProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ViewportProvider>
  );
}


import React, { useEffect } from 'react'
import { AppRouter } from '@/router/AppRouter'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { RootState } from '@/store/store'
import { setViewport } from '@/store/slices/viewportSlice'
import { setConnected, setLastMessage } from '@/store/slices/websocketSlice'
import { getToken } from '@/services/StorageService'
import { setTheme } from '@/store/slices/themeSlice'
import type { WsMessage } from '@/store/slices/websocketSlice'

let ws: WebSocket | null = null

export default function App() {
  const dispatch = useAppDispatch()

}
