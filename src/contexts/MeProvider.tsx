import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getMe, getMyCompany, getMyWms, getMyRole } from '@/api/MeService';
import { User } from '@/types/user';
import { Company } from '@/types/company';
import { Wms } from '@/types/wms';
import { Role } from '@/types/role';

interface MeContextType {
  me: User | null;
  myCompany: Company | null;
  myWms: Wms | null;
  myRole: Role | null;
  loading: boolean;
  error: string | null;
  fetchMeData: () => Promise<void>;
  fetchMyCompany: () => Promise<void>;
  fetchMyWms: () => Promise<void>;
  fetchMyRole: () => Promise<void>;
}

export const MeContext = createContext<MeContextType>({
  me: null,
  myCompany: null,
  myWms: null,
  myRole: null,
  loading: false,
  error: null,
  fetchMeData: async () => {},
  fetchMyCompany: async () => {},
  fetchMyWms: async () => {},
  fetchMyRole: async () => {},
});

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<User | null>(null);
  const [myCompany, setCompany] = useState<Company | null>(null);
  const [myWms, setWms] = useState<Wms | null>(null);
  const [myRole, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getMe();
      setMe(resp.me);
    } catch (err: any) {
      console.error('[MeProvider] fetchMe error:', err);
      setError(err?.message || 'Failed to load user');
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyCompany = useCallback(async () => {
    if (!me?.companyID) {
      setCompany(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompany();
      setCompany(resp.myCompany);
    } catch (err: any) {
      console.error('[MeProvider] fetchMyCompany error:', err);
      setError(err?.message || 'Failed to load company');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [me]);

  const fetchMyWms = useCallback(async () => {
    if (!me?.wmsID) {
      setWms(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWms();
      // Expecting { myWms: { ...Wms } }
      setWms(resp.myWms);
    } catch (err: any) {
      console.error('[MeProvider] fetchMyWms error:', err);
      setError(err?.message || 'Failed to load wms');
      setWms(null);
    } finally {
      setLoading(false);
    }
  }, [me]);

  const fetchMyRole = useCallback(async () => {
    if (!me?.roleID) {
      setRole(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyRole();
      // Expecting { myRole: { ...Role } }
      setRole(resp.myRole || null);
    } catch (err: any) {
      console.error('[MeProvider] fetchMyRole error:', err);
      setError(err?.message || 'Failed to load role');
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [me]);

  // On mount => fetch me & related
  useEffect(() => {
    (async () => {
      await fetchMeData();
    })();
  }, [fetchMeData]);

  useEffect(() => {
    (async () => {
      await fetchMyCompany();
    })();
  }, [fetchMyCompany]);

  useEffect(() => {
    (async () => {
      await fetchMyWms();
    })();
  }, [fetchMyWms]);

  useEffect(() => {
    (async () => {
      await fetchMyRole();
    })();
  }, [fetchMyRole]);

  // Whenever "me" changes, we can auto-fetch company/wms/role if needed
  useEffect(() => {
    if (me) {
      fetchMyCompany();
      fetchMyWms();
      fetchMyRole();
    } else {
      setCompany(null);
      setWms(null);
      setRole(null);
    }
  }, [me, fetchMyCompany, fetchMyWms, fetchMyRole]);

  return (
    <MeContext.Provider
      value={{
        me,
        myCompany,
        myWms,
        myRole,
        loading,
        error,
        fetchMeData,
        fetchMyCompany,
        fetchMyWms,
        fetchMyRole,
      }}
    >
      {children}
    </MeContext.Provider>
  );
}

