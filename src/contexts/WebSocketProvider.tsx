import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { getToken } from '@/services/StorageService'

export interface WsMessage {
  channel: string
  data: any
}

interface WebSocketContextValue{
  connected: boolean
  lastMessage: WsMessage | null
  sendMessage: (msg: object) => void
  subscribeChannel: (channel: string) => void
  unsubscribeChannel: (channel: string) => void
}

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  lastMessage: null,
  sendMessage: () => {},
  subscribeChannel: () => {},
  unsubscribeChanne: () => {},
})

export function useWebSocketContext() {
  return useContext(WebSocketContext)
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptRef = useRef<number>(0)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxReconnectAttempts = 0
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])
  const scheduleReconnect = useCallback(() => {
    clearReconnectTimer()
    reconnectAttemptRef.current += 1
    if (maxReconnectAttempts > 0 && reconnectAttemptRef.current > maxReconnectAttempts) {
      console.warn('[WS] Max reconnect attempts reached. Giving up.')
      return
    }
    const attempt = reconnectAttemptRef.current
    const delaySeconds = Math.min(30, Math.pow(2, attempt))
    console.log(`[WS] Scheduling reconnect attempt #${attempt} in ${delaySeconds}s...`)
    reconnectTimerRef.current = setTimeout(() => {
      connect()
    }, delaySeconds * 1000)
  }, [clearReconnectTimer, maxReconnectAttempts])
  const connect = useCallback(() => {
    clearReconnectTimer()
    const token = getToken()
    if (!token) {
      console.warn('[WS] No token found, skipping WS connect.')
      setConnected(false)
      return
    }
    const httpBase = import.meta.env.VITE_API_BASE_URL || 'https://www.slotter.ai/api'
    const wsScheme = httpBase.startsWith('https') ? 'ws' : 'ws'
    const fullUrl = httpBase.replace(/^https?:/, wsScheme + ':') + '/ws'
    const finalUrl = `${fullUrl}?token=${encodeURIComponent(token)}`
    console.log('[WS] Attempting to connect =>', finalUrl)
    const ws = new WebSocket(finalUrl)
    wsRef.current = ws
    ws.onopen = () => {
      console.log('[WS] onopen => connected!')
      setConnected(true)
      reconnectAttemptRef.current = 0
    }
    ws.onclose = (ev) => {
      console.log(`[WS] onclose code=${ev.code}, reason=${ev.reason}`)
      setConnected(false)
      wsRef.current = null
      if (ev.code === 1000) {
        return
      }
      scheduleReconnect()
    }
    ws.onerror = (err) => {
      console.error('[WS] onerror =>', err)
    }
    ws.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data)
        setLastMessage(payload)
      } catch (err) {
        console.warn('[WS] Failed to parse inbound message =>', evt.data)
      }
    }
  }, [scheduleReconnect, clearReconnectTimer])
  useEffect(() => {
    const token = getToken()
    if (token) {
      connect()
    } else {
      if (wsRef.current) {
        wsRef.current.close(1000, 'no token')
      }
      setConnected(false)
    }
    return () => {
      clearReconnectTimer()
      if (wsRef.current) {
        wsRef.current.close(1000, 'unmount')
      }
    }
  }, [connect, clearReconnectTimer])
  const sendMessage = useCallback((msg: object) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Not connected, cannot send =>', msg)
      return
    }
    wsRef.current.send(JSON.stringify(msg))
  }, [])
  const subscribeChannel = useCallback((channel: string) => {
    sendMessage({ action: 'subscribe', channel })
  }, [sendMessage])
  const unsubscribeChannel = useCallback((channel: string) => {
    sendMessage({ action: 'unsubscribe', channel })
  }, [sendMessage])
  const value: WebSocketContextValue = {
    connected,
    lastMessage,
    sendMessage,
    subscribeChannel,
    unsubscribeChannel,
  }
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
