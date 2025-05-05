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
import { useSSEContext } from '@/contexts/SSEProvider';

interface MyWmsContextValue {
  myWms: Wms | null;
  myCompanies: Company[] | null;
  myUsers: User[] | null;
  loading: boolean;
  error: string | null;
  fetchMyWms: () => Promise<void>;
  fetchMyCompanies: () => Promise<void>;
  fetchMyUsers: () => Promise<void>;
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
});

export function useMyWms() {
  return useContext(MyWmsContext);
}

export function MyWmsProvider({ children }: { children: ReactNode }) {
  const { me } = useContext(MeContext);
  const { connected, lastMessage, subscribeChannel, unsubscribeChannel } = useSSEContext();
  const [myWms, setMyWms] = useState<Wms | null>(null);
  const [myCompanies, setMyCompanies] = useState<Company[] | null>(null);
  const [myUsers, setMyUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyWms = useCallback(async () => {
    if (!me?.wmsID) {
      setMyWms(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWms();
      setMyWms(resp.myWms);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyWms error:', err);
      setError(err.message || 'Failed to fetch myWms');
      setMyWms(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  const fetchMyCompanies = useCallback(async () => {
    if (!me?.wmsID) {
      setMyCompanies(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWmsCompanies();
      setMyCompanies(resp.myWmsCompanies);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyCompanies error:', err);
      setError(err.message || 'Failed to fetch my wms companies');
      setMyCompanies(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  const fetchMyUsers = useCallback(async () => {
    if (!me?.wmsID) {
      setMyUsers(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWmsUsers();
      setMyUsers(resp.myWmsUsers);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyUsers error:', err);
      setError(err.message || 'Failed to fetch my wms users');
      setMyUsers(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  useEffect(() => {
    if (me?.userType === 'wms' && me.wmsID) {
      fetchMyWms();
      fetchMyCompanies();
      fetchMyUsers();
    } else {
      setMyWms(null);
      setMyCompanies(null);
      setMyUsers(null);
    }
  }, [me?.userType, me?.wmsID, fetchMyWms, fetchMyCompanies, fetchMyUsers]);

  useEffect(() => {
    if (!connected) return;
    if (me?.userType === 'wms' && me.wmsID) {
      const wmsChan = 'wms:' + me.wmsID;
      subscribeChannel(wmsChan);
      return () => {
        unsubscribeChannel(wmsChan);
      };
    }
  }, [connected, me?.userType, me?.wmsID, subscribeChannel, unsubscribeChannel]);

  useEffect(() => {
    if (!lastMessage) return;
    const { event, channel } = lastMessage;
    if (me?.userType !== 'wms' || !me.wmsID) return;
    const wmsChan = 'wms:' + me.wmsID;
    if (channel === wmsChan) {
      switch (event) {
        case 'UserJoined':
        case 'UserLeft':
        case 'UserAvatarChanged':
        case 'UserNameChanged':
          fetchMyUsers();
          break;
        case 'WmsAvatarUpdated':
        case 'WmsNameChanged':
        case 'WmsDeleted':
          fetchMyWms();
          break;
        case 'CompanyCreated':
        case 'CompanyDeleted':
          fetchMyCompanies();
          break;
      }
    }
  }, [lastMessage, me?.userType, me?.wmsID, fetchMyWms, fetchMyCompanies, fetchMyUsers]);

  const value: MyWmsContextValue = {
    myWms,
    myCompanies,
    myUsers,
    loading,
    error,
    fetchMyWms,
    fetchMyCompanies,
    fetchMyUsers,
  };

  return (
    <MyWmsContext.Provider value={value}>
      {children}
    </MyWmsContext.Provider>
  );
}
