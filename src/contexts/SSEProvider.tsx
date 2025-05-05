import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getToken } from '@/services/StorageService';
import SSEService from '@/api/SSEService';

export interface SSEMessage {
  event: string;
  channel: string;
}

interface SSEContextValue {
  connected: boolean;
  lastMessage: SSEMessage | null;
  subscribeChannel: (channel: string) => void;
  unsubscribeChannel: (channel: string) => void;
}

const SSEContext = createContext<SSEContextValue>({
  connected: false,
  lastMessage: null,
  subscribeChannel: () => {},
  unsubscribeChannel: () => {},
});

export function useSSEContext(): SSEContextValue {
  return useContext(SSEContext);
}

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const initializedRef = useRef(false);
  const retryTimer = useRef<number | null>(null);

  const scheduleRetry = useCallback((delay = 1000) => {
    if (retryTimer.current) window.clearTimeout(retryTimer.current);
    retryTimer.current = window.setTimeout(() => connect(), delay);
  }, []);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.warn('[SSEProvider] No token found, retrying SSE connect...');
      setConnected(false);
      scheduleRetry();            // <── retry until token exists
      return;
    }

    SSEService.connect();
    SSEService.onOpen(() => {
      console.log('[SSEProvider] onopen => connected!');
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
      setConnected(true);
    });
    SSEService.onError((err) => {
      console.error('[SSEProvider] onerror =>', err);
      setConnected(false);
      SSEService.close();
      scheduleRetry(2000);        // <── retry on stream error
    });
    SSEService.onMessage((evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        setLastMessage({
          event: parsed.event,
          channel: parsed.channel,
        });
      } catch (error) {
        console.warn('[SSEProvider] Failed to parse SSE data =>', evt.data, error);
      }
    });
  }, [scheduleRetry]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      connect();
    }
    return () => {
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
      SSEService.close();
    };
  }, [connect]);

  const subscribeChannel = useCallback(async (channel: string) => {
    try {
      await SSEService.subscribe(channel);
    } catch (err) {
      console.error('[SSEProvider] Failed to subscribe =>', err);
    }
  }, []);

  const unsubscribeChannel = useCallback(async (channel: string) => {
    try {
      await SSEService.unsubscribe(channel);
    } catch (err) {
      console.error('[SSEProvider] Failed to unsubscribe =>', err);
    }
  }, []);

  const value: SSEContextValue = {
    connected,
    lastMessage,
    subscribeChannel,
    unsubscribeChannel,
  };
  
  return (
    <SSEContext.Provider value={value}>
      {children}
    </SSEContext.Provider>
  );
}

