import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Company } from '@/types/company'
import { Warehouse } from '@/types/warehouse'
import { User } from '@/types/user'
import { MeContext } from './MeProvider'
import {
  getMyCompany,
  getMyCompanyWarehouses,
  getMyUsers,
} from '@/api/MyCompanyService'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'

interface MyCompanyContextValue {
  myCompany: Company | null
  myWarehouses: Warehouse[] | null
  myUsers: User[] | null
  loading: boolean
  error: string | null
  fetchMyCompany: () => Promise<void>
  fetchMyWarehouses: () => Promise<void>
  fetchMyUsers: () => Promise<void>
}

const MyCompanyContext = createContext<MyCompanyContextValue>({
  myCompany: null,
  myWarehouses: null,
  myUsers: null,
  loading: false,
  error: null,
  fetchMyCompany: async () => {},
  fetchMyWarehouses: async () => {},
  fetchMyUsers: async () => {},
})

export function useMyCompany() {
  return useContext(MyCompanyContext)
}

export function MyCompanyProvider({ children }: { children: ReactNode }) {
  const { me } = useContext(MeContext)
  const { lastMessage, subscribeChannel, unsubscribeChannel } = useWebSocketContext()
  const [myCompany, setMyCompany] = useState<Company | null>(null)
  const [myWarehouses, setMyWarehouses] = useState<Warehouse[] | null>(null)
  const [myUsers, setMyUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyCompany = useCallback(async () => {
    if (!me?.companyID) {
      setMyCompany(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyCompany()
      setMyCompany(resp.myCompany)
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyCompany error:', err)
      setError(err.message || 'Failed to fetch myCompany')
      setMyCompany(null)
    } finally {
      setLoading(false)
    }
  }, [me?.companyID])

  const fetchMyWarehouses = useCallback(async () => {
    if (!me?.companyID) {
      setMyWarehouses(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyCompanyWarehouses()
      setMyWarehouses(resp.warehouses || [])
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchWarehouses error:', err)
      setError(err.message || 'Failed to fetch company warehouses')
      setMyWarehouses(null)
    } finally {
      setLoading(false)
    }
  }, [me?.companyID])

  const fetchMyUsers = useCallback(async () => {
    if (!me?.companyID) {
      setMyUsers(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await getMyCompanyUsers()
      setMyUsers(resp.users || [])
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyUsers error:', err)
      setError(err.message || 'Failed to fetch company users')
      setMyUsers(null)
    } finally {
      setLoading(false)
    }
  }, [me?.companyID])

  useEffect(() => {
    if (me?.userType === 'company' && me.companyID) {
      fetchMyCompany()
      fetchMyWarehouses()
      fetchMyUsers()
    } else {
      setMyCompany(null)
      setMyWarehouses(null)
      setMyUsers(null)
    }
  }, [me, fetchMyCompany, fetchMyWarehouses, fetchMyUsers])

  useEffect(() => {
    if (me?.userType === 'company' && me.companyID) {
      const companyChan = 'company:' + me.companyID
      subscribeChannel(companyChan)
      return () => {
        unsubscribeChannel(companyChan)
      }
    }
  }, [me?.userType, me?.companyID, subscribeChannel, unsubscribeChannel])

  useEffect(() => {
    if (!lastMessage) return
    const { channel, data } = lastMessage
    if (me?.userType !== 'company' || !me.companyID) return
    const companyChan = 'company:' + me.companyID
    if (channel === companyChan) {
      const action = data?.action
      if (action === 'company_updated') {
        fetchMyCompany()
        fetchMyWarehouses()
        fetchMyUsers()
      }
    }
  }, [lastMessage, me?.userType, me?.companyID, fetchMyCompany, fetchMyWarehouses, fetchMyUsers])

  const value: MyCompanyContextValue = {
    myCompany,
    myWarehouses,
    myUsers,
    loading,
    error,
    fetchMyCompany,
    fetchMyWarehouses,
    fetchMyUsers,
  }

  return (
    <MyCompanyContext.Provider value={value}>
      {children}
    </MyCompanyContext.Provider>
  );
}
