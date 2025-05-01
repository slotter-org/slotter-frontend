import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Wms } from '@/types/wms'
import { Company } from '@/types/company'
import { User } from '@/types/user'
import { MeContext } from './MeProvider'
import {
  getMyWms,
  getMyWmsCompanies,
  getMyUsers,
} from '@/api/MyWmsService'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'

interface MyWmsContextValue {
  myWms: Wms | null
  myCompanies: Company[] | null
  myUsers: User[] | null
  loading: boolean
  error: string | null
  fetchMyWms: () => Promise<void>
  fetchMyCompanies: () => Promise<void>
  fethcMyUsers: () => Promise<void>
}

const MyWmsContext = createContext<MyWmsContextValue>({
  myWms: null,
  myCompanies: null,
  myUsers: null,
  loading: false,
})

