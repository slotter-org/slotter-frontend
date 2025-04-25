import React, { useContext } from 'react'
import { MeContext } from './MeProvider'
import { MyCompanyProvider } from './MyCompanyProvider'
import { MyWmsProvider } from './MyWmsProvider'

export function MyEntityProvider({ children }: { children: React.ReactNode }) {
  const { me } = useContext(MeContext)
  if (me?.userType === "company" && me.companyID) {
    return <MyCompanyProvider>{children}</MyCompanyProvider>
  }
  if (me?.userType === 'wms' && me.wmsID) {
    return <MyWmsProvider>{children}</MyWmsProvider>
  }
  return <>{children}</>
}
