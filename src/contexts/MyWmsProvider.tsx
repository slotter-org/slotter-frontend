import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Wms } from '@/types/wms';
import { Company } from '@/types/company';
import { User } from '@/types/user';
import { MeContext } from './MeProvider';
import {
  getMyWms,
  getMyWmsCompanies,
  getMyWmsUsers,
} from '@/api/MyWmsService';
import { useWebSocketContext } from '@/contexts/WebSocketProvider';

interface MyWmsContextValue {
  myWms: Wms | null
  myCompanies: Company[] | null
  myUsers: User[] | null
  loading: boolean
  error: string | null
  fetchMyWms: () => Promise<void>
  fetchMyCompanies: () => Promise<void>
  fetchMyUsers: () => Promise<void>
}

const MyWmsContext = createContext<MyWmsContextValue>({
  myWms: null,
  myCompanies: null,
  myUsers: null,
  loading: false,
  error: null,
  fetchMyWms: async () => {},
  fetchMyCompanies: async () => {},
  fetchMyUsers: async () => {},
})

export function useMyWms() {
  return useContext(MyWmsContext)
}

export function MyWmsProvider({ children }: { children: ReactNode }) {
  const { me } = useContext(MeContext)
  const { lastMessage, subscribeChannel, unsubscribeChannel } = useWebSocketContext()
  const [myWms, setMyWms] = useState<Wms | null>(null)
  const [myCompanies, setMyCompanies] = useState<Company[] | null>(null)
  const [myUsers, setMyUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyCompany = useCallback(async () => {
    if (!me?.wmsID) {
      setMyWms(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyWms()
      setMyWms(resp.myWms)
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyWms error:', err)
      setError(err.message || 'Failed to fetch myWms')
      setMyWms(null)
    } finally {
      setLoading(false)
    }
  }, [me?.wmsID])

  const fetchMyCompanies = useCallback(async () => {
    if (!me?.wmsID) {
      setMyCompanies(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyWmsCompanies()
      setMyCompanies(resp.companies || [])
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyCompanies error:', err)
      setError(err.message || 'Failed to fetch wms companies')
      setMyCompanies(null)
    } finally {
      setLoading(false)
    }
  }, [me?.wmsID])

  const fetchMyUsers = useCallback(async () => {
    if (!me?.wmsID) {
      setMyUsers(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyWmsUsers()
      setMyUsers(resp.users || [])
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyUsers error:', err)
      setMyUsers(null)
    } finally {
      setLoading(false)
    }
  }, [me?.wmsID])

  useEffect(() => {
    if (me?.userType === 'wms' && me.wmsID) {
      fetchMyWms()
      fetchMyCompanies()
      fetchMyUsers()
    } else {
      setMyWms(null)
      setMyCompanies(null)
      setMyUsers(null)
    }
  }, [me, fetchMyWms, fetchMyCompanies, fetchMyUsers])

  useEffect(() => {
    if (me?.userType === 'wms' && me.wmsID) {
      const wmsChan = 'wms:' + me.wmsID
      subscribeChannel(wmsChan)
      return () => {
        unsubscribeChannel(wmsChan)
      }
    }
  }, [me?.userType, me?.wmsID, subscribeChannel, unsubscribeChannel])

  useEffect(() => {
    if (!lastMessage) return
    const { channel, data } = lastMessage
    if (me?.userType !== 'wms' || !me.wmsID) return
    const wmsChan = 'wms:' + me.wmsID
    if (channel === wmsChan) {
      const action = data?.action
      switch (action) {
        case 'wms_info_update': {
          fetchMyWms()
        }
        case 'wms_users_update': {
          fetchMyUsers()
        }
        case 'wms_companies_update': {
          fetchMyCompanies()
        }
        default: {
          console.log('invalid wms event')
        }
      }
    }
  }, [lastMessage, me?.userType, me?.wmsID, fetchMyWms, fetchMyCompanies, fetchMyUsers])

  const value: MyWmsContextValue = {
    myWms,
    myCompanies,
    myUsers,
    loading,
    error,
    fetchMyWms,
    fetchMyCompanies,
    fetchMyUsers,
  }

  return (
    <MyWmsContext.Provider value={value}>
      {children}
    </MyWmsContext.Provider>
  )
}
