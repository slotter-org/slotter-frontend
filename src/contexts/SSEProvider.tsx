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
  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.warn('[SSEProvider] No token found, skipping SSE connect.')
      setConnected(false);
      return;
    }
    SSEService.connect();
    SSEService.onOpen(() => {
      console.log('[SSEProvider] onopen => connected!');
      setConnected(true);
    });
    SSEService.onError((err) => {
      console.error('[SSEProvider] onerror =>', err);
      setConnected(false);
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
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      connect();
    }
    return () => {
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
