import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Company } from '@/types/company';
import { Warehouse } from '@/types/warehouse';
import { User } from '@/types/user';
import { Invitation } from '@/types/invitation';
import { Role } from '@/types/role';
import { MeContext } from './MeProvider';
import {
  getMyCompany,
  getMyCompanyWarehouses,
  getMyCompanyUsers,
  getMyCompanyRoles,
  getMyCompanyInvitations,
} from '@/api/MyCompanyService';
import { useSSEContext } from '@/contexts/SSEProvider';

interface MyCompanyContextValue {
  myCompany: Company | null;
  myWarehouses: Warehouse[] | null;
  myUsers: User[] | null;
  myRoles: Role[] | null;
  myInvitations: Invitation[] | null;
  loading: boolean;
  error: string | null;
  fetchMyCompany: () => Promise<void>;
  fetchMyWarehouses: () => Promise<void>;
  fetchMyUsers: () => Promise<void>;
  fetchMyRoles: () => Promise<void>;
  fetchMyInvitations: () => Promise<void>;
}

const MyCompanyContext = createContext<MyCompanyContextValue>({
  myCompany: null,
  myWarehouses: null,
  myUsers: null,
  myRoles: null,
  myInvitations: null,
  loading: false,
  error: null,
  fetchMyCompany: async () => {},
  fetchMyWarehouses: async () => {},
  fetchMyUsers: async () => {},
  fetchMyRoles: async () => {},
  fetchMyInvitations: async () => {},
});

export function useMyCompany() {
  return useContext(MyCompanyContext);
}

export function MyCompanyProvider({ children }: { children: ReactNode }) {
  const { me } = useContext(MeContext);
  const { connected, lastMessage, subscribeChannel, unsubscribeChannel } = useSSEContext();
  const [myCompany, setMyCompany] = useState<Company | null>(null);
  const [myWarehouses, setMyWarehouses] = useState<Warehouse[] | null>(null);
  const [myUsers, setMyUsers] = useState<User[] | null>(null);
  const [myRoles, setMyRoles] = useState<Role[] | null>(null);
  const [myInvitations, setMyInvitations] = useState<Invitation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMyCompany = useCallback(async () => {
    if (!me?.companyID) {
      setMyCompany(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompany();
      setMyCompany(resp.myCompany);
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyCompany error:', err);
      setError(err.message || 'Failed to fetch myCompany');
      setMyCompany(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  const fetchMyWarehouses = useCallback(async () => {
    if (!me?.companyID) {
      setMyWarehouses(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompanyWarehouses();
      setMyWarehouses(resp.myWarehouses);
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyWarehouses error:', err)
      setError(err.message || 'Failed to fetch my company warehouses');
      setMyWarehouses(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  const fetchMyUsers = useCallback(async () => {
    if (!me?.companyID) {
      setMyUsers(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompanyUsers();
      setMyUsers(resp.myUsers);
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyUsers error:', err)
      setError(err.message || 'Failed to fetch my company users');
      setMyUsers(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  const fetchMyRoles = useCallback(async () => {
    if (!me?.companyID) {
      setMyRoles(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompanyRoles();
      setMyRoles(resp.myRoles);
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyRoles error:', err)
      setError(err.message || 'Failed to fetch my company roles');
      setMyRoles(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  const fetchMyInvitations = useCallback(async () => {
    if (!me?.companyID) {
      setMyInvitations(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompanyInvitations();
      setMyInvitations(resp.myInvitations);
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyInvitations error:', err)
      setError(err.message ||'Failed to fetch my company invitations');
      setMyInvitations(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  useEffect(() => {
    if (me?.userType === 'company' && me.companyID) {
      fetchMyCompany();
      fetchMyWarehouses();
      fetchMyUsers();
      fetchMyRoles();
      fetchMyInvitations();
    } else {
      setMyCompany(null);
      setMyWarehouses(null);
      setMyUsers(null);
      setMyRoles(null);
      setMyInvitations(null);
    }
  }, [me, fetchMyCompany, fetchMyWarehouses, fetchMyUsers, fetchMyRoles, fetchMyInvitations]);

  useEffect(() => {
    if (!connected) return;
    if (me?.userType === 'company' && me.companyID) {
      const companyChan = 'company:' + me.companyID;
      subscribeChannel(companyChan);
      return () => {
        unsubscribeChannel(companyChan);
      };
    }
  }, [connected, me?.userType, me?.companyID, subscribeChannel, unsubscribeChannel]);

  useEffect(() => {
    if (!lastMessage) return;
    const { event, channel } = lastMessage;
    if (me?.userType !== 'company' || !me.companyID) return;
    const companyChan = 'company:' + me.companyID;
    if (channel === companyChan) {
      switch (event) {
        case 'UserJoined':
        case 'UserLeft':
        case 'UserAvatarUpdated':
        case 'UserNameChanged':
          fetchMyUsers();
          break;
        case 'CompanyAvatarUpdated':
        case 'CompanyNameChanged':
        case 'CompanyDeleted':
          fetchMyCompany();
          break;
        case 'WarehouseCreated':
        case 'WarehouseDeleted':
        case 'WarehouseNameChanged':
          fetchMyWarehouses();
          break;
        case 'UserRoleUpdated':
          fetchMyUsers();
          fetchMyRoles();
          break;
        case 'CompanyRoleNameChanged':
        case 'CompanyRoleUpdated':
          fetchMyRoles();
          break;
        case 'CompanyInvitationCreated':
        case 'CompanyInvitationDeleted':
        case 'CompanyInvitationAccepted':
        case 'CompanyInvitationCanceled':
        case 'CompanyInvitationExpired':
        case 'CompanyInvitationPending':
          fetchMyUsers();
          fetchMyInvitations();
          break;
        default:
          break;
      }
    }
  }, [lastMessage, me?.userType, me?.companyID, fetchMyCompany, fetchMyWarehouses, fetchMyUsers, fetchMyRoles, fetchMyInvitations]);

  const value: MyCompanyContextValue = {
    myCompany,
    myWarehouses,
    myUsers,
    myRoles,
    myInvitations,
    loading,
    error,
    fetchMyCompany,
    fetchMyWarehouses,
    fetchMyUsers,
    fetchMyRoles,
    fetchMyInvitations,
  };
  
  return (
    <MyCompanyContext.Provider value={value}>
      {children}
    </MyCompanyContext.Provider>
  );
}
