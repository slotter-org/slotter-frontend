import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Company } from '@/types/company'
import { MeContext } from './MeProvider'
import { getWmsCompanies } from '@/api/WmsService'

interface MyWmsContextValue {
  companies: Company[] | null
  loading: boolean
  error: string | null
  fetchCompanies: () => Promise<void>
}

const MyWmsContext = createContext<MyWmsContextValue>({
  companies: null,
  loading: false,
  error: null,
  fetchCompanies: async () => {},
})

export function useMyWms() {
  return useContext(MyWmsContext)
}

export function MyWmsProvider({ children }: { children: ReactNode }) {
  const { me, myWms } = useContext(MeContext)
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchCompanies = useCallback(async () => {
    if (!me?.wmsID) {
      setCompanies(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getWmsCompanies(me.wmsID)
      setCompanies(data)
    } catch (err: any) {
      console.error("[MyWmsProvider] fetchCompanies error:", err)
      setError(err.message || "Failed to fetch Wms companies")
      setCompanies(null)
    } finally {
      setLoading(false)
    }
  }, [me?.wmsID])

  useEffect(() => {
    if (me?.wmsID) {
      fetchCompanies()
    } else {
      setCompanies(null)
    }
  }, [me?.wmsID, fetchCompanies])

  const value: MyWmsContextValue = {
    companies,
    loading,
    error,
    fetchCompanies,
  }
  return (
    <MyWmsContext.Provider value={value}>
      {children}
    </MyWmsContext.Provider>
  )
}

