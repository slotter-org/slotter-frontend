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
import { MeContext } from './MeProvider'
import { getCompanyWarehouses } from '@/api/CompanyService'

interface MyCompanyContextValue {
  warehouses: Warehouse[] | null
  loading: boolean
  error: string | null
  fetchWarehouses: () => Promise<void>
}

const MyCompanyContext = createContext<MyCompanyContextValue>({
  warehouses: null,
  loading: false,
  error: null,
  fetchWarehouses: async () => {},
})

export function useMyCompany() {
  return useContext(MyCompanyContext)
}

export function MyCompanyProvider({ children }: { children: ReactNode }) {
  const { me, myCompany } = useContext(MeContext)
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchWarehouses = useCallback(async () => {
    if (!me?.companyID) {
      setWarehouses(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyWarehouses(me.companyID)
      setWarehouses(data)
    } catch (err: any) {
      console.error("[MyCompanyProvider] fetchWarehouses error:", err)
      setError(err.message || "Failed to fetch company warehouses")
      setWarehouses(null)
    } finally {
      setLoading(false)
    }
  }, [me?.companyID])

  useEffect(() => {
    if (me?.companyID) {
      fetchWarehouses()
    } else {
      setWarehouses(null)
    }
  }, [me?.companyID, fetchWarehouses])

  const value: MyCompanyContextValue = {
    warehouses,
    loading,
    error,
    fetchWarehouses,
  }
  return (
    <MyCompanyContext.Provider value={value}>
      {children}
    </MyCompanyContext.Provider>
  )
}


