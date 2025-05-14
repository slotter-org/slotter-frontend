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

export interface SSEContentValue {
  connected: boolean;
  lastMessage: SSEMessage | null;
  subscribeChannel: (channel: string) => Promise<void>;
  unsubscribeChannel: (channel: string) => Promise<void>;
}

const SSEContext = createContext<SSEContextValue>({
  connected: false,
  lastMessage: null,
  subscribeChannel: async () => {},
  unsubscribeChannel: async () => {},
});

export function useSSEContext(): SSEContextValue {
  return useContext(SSEContext);
}

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const subscribedChannelsRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);
  const retryTimer = useRef<number | null>(null);
  const resetState = useCallback(() => {
    setConnected(false);
    setLastMessage(null);
    subscribedChannelsRef.current.clear();
    if (retryTimer.current) {
      window.clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    SSEService.close();
  }, []);
  const scheduleRetry = useCallback((delay = 1000) => {
    if (retryTimer.current) window.clearTimeout(retryTimer.current);
    retryTimer.current = window.setTimeout(() => {
      connect();
    }, delay);
  }, []);
  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.warn('[SSEProvider] No token found, will retry...');
      setConnected(false);
      scheduleRetry(2000);
      return;
    }
    SSEService.connect();
    SSEService.onOpen(() => {
      console.log('[SSEProvider] onopen => connected!');
      if (retryTimer.current) {
        window.clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      setConnected(true);
    });
    SSEService.onError((err) => {
      console.error('[SSEProvider] onerror =>', err);
      setConnected(false);
      SSEService.close();
      scheduleRetry(3000);
    });
    SSEService.onMessage((evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        setLastMessage({ event: parsed.event, channel: parsed.channel });
      } catch (error) {
        console.warn('[SSEProvider] Failed to parse SSE data =>', evt.data, error);
      }
    });
  }, [scheduleRetry]);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      connect();
    }
    return () => {
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
      resetState();
    };
  }, [connect, resetState]);
  const subscribeChannel = useCallback(async (channel: string) => {
    if (!connected) {
      console.warn(`[SSEProvider] Not connected yet, cannot subscribe to ${channel}.`);
      return;
    }
    if (subscribedChannelsRef.current.has(channel)) {
      return;
    }
    try {
      await SSEService.subscribe(channel);
      subscribedChannelsRef.current.add(channel);
    } catch (err) {
      console.error(`[SSEProvider] Failed to subscribe ${channel} =>`, err);
    }
  }, [connected]);
  const unsubscribeChannel = useCallback(async (channel: string) => {
    if (!subscribedChannelsRef.current.has(channel)) {
      return;
    }
    try {
      await SSEService.unsubscribe(channel);
      subscribedChannelsRef.current.delete(channel);
    } catch (err) {
      console.error(`[SSEProvider] Failed to unsubscribe =>`, err);
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
