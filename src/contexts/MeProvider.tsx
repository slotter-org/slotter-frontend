import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { getMe, getMyRole } from '@/api/MeService'
import { User } from '@/types/user'
import { Role } from '@/types/role'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'

interface MeContextType {
  me: User | null
  myRole: Role | null
  loading: boolean
  error: string | null
  fetchMeData: () => Promise<void>
  fetchMyRole: () => Promise<void>
}

export const MeContext = createContext<MeContextType>({
  me: null,
  myRole: null,
  loading: false,
  error: null,
  fetchMeData: async () => {},
  fetchMyRole: async () => {},
})

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<User | null>(null)
  const [myRole, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { lastMessage, subscribeChannel, unsubscribeChannel } = useWebSocketContext()
  const fetchMeData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await getMe()
      setMe(resp.me)
    } catch (err: any) {
      console.error('[MeProvider] fetchMeData error:', err)
      setError(err?.message || 'Failed to load user')
      setMe(null)
    } finally {
      setLoading(false)
    }
  }, [])
  const fetchMyRole = useCallback(async () => {
    if (!me?.roleID) {
      setRole(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyRole()
      setRole(resp.myRole || null)
    } catch (err: any) {
      console.error('[MeProvider] fetchMyRole error:', err)
      setError(err?.message || 'Failed to load role')
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [me?.roleID])
  useEffect(() => {
    (async () => {
      await fetchMeData()
    })()
  }, [fetchMeData])
  useEffect(() => {
    if (me?.roleID) {
      fetchMyRole()
    } else {
      setRole(null)
    }
  }, [me?.roleID, fetchMyRole])
  useEffect(() => {
    if (!me?.id) return
    const userChan = 'user:' + me.id
    subscribeChannel(userChan)
    return () => {
      unsubscribeChannel(userChan)
    }
  }, [me?.id, subscribeChannel, unsubscribeChannel])
  useEffect(() => {
    if (!lastMessage) return
    const { channel, data } = lastMessage
    if (!me?.id) return
    const userChan = 'user:' + me.id
    if (channel === userChan) {
      const action = data?.action
      if (action === 'user_updated') {
        fetchMeData()
      } else if (action === 'role_updated') {
        fetchMeData()
        fetchMyRole()
      }
    }
  }, [lastMessage, me?.id, fetchMeData, fetchMyRole])
  
  return (
    <MeContext.Provider
      value={{
        me,
        myRole,
        loading,
        error,
        fetchMeData,
        fetchMyRole,
      }}
    >
      {children}
    </MeContext.Provider>
  )
}
