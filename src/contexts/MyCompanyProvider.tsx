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
import { Permission } from '@/types/permission';
import { MeContext } from '@/contexts/MeProvider';
import {
  getMyCompany,
  getMyCompanyWarehouses,
  getMyCompanyUsers,
  getMyCompanyRoles,
  getMyCompanyInvitations,
  getMyCompanyPermissions,
} from '@/api/MyCompanyService';
import { useSSEContext } from '@/contexts/SSEProvider';

interface MyCompanyContextValue {
  myCompany: Company | null;
  myWarehouses: Warehouse[] | null;
  myUsers: User[] | null;
  myRoles: Role[] | null;
  myPermissions: Permission[] | null;
  myInvitations: Invitation[] | null;
  loading: boolean;
  error: string | null;
  fetchMyCompany: () => Promise<void>;
  fetchMyWarehouses: () => Promise<void>;
  fetchMyUsers: () => Promise<void>;
  fetchMyRoles: () => Promise<void>;
  fetchMyPermissions: () => Promise<void>;
  fetchMyInvitations: () => Promise<void>;
}

const MyCompanyContext = createContext<MyCompanyContextValue>({
  myCompany: null,
  myWarehouses: null,
  myUsers: null,
  myRoles: null,
  myPermissions: null,
  myInvitations: null,
  loading: false,
  error: null,
  fetchMyCompany: async () => {},
  fetchMyWarehouses: async () => {},
  fetchMyUsers: async () => {},
  fetchMyRoles: async () => {},
  fetchMyPermissions: async () => {},
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
  const [myPermissions, setMyPermissions] = useState<Permission[] | null>(null);
  const [myInvitations, setMyInvitations] = useState<Invitation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //------------------------------Fetch Helpers--------------------------------------
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
      console.error('[MyCompanyProvider] fetchMyWarehouses error:', err);
      setError(err.message || 'Failed to fetch myWarehouses');
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
      console.error('[MyCompanyProvider] fetchMyUsers error:', err);
      setError(err.message || 'Failed to fetch myUsers');
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
      setMyRoles(resp.myRoles)
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyRoles error:', err);
      setError(err.message || 'Failed to fetch myRoles');
      setMyRoles(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  const fetchMyPermissions = useCallback(async () => {
    if (!me?.companyID) {
      setMyPermissions(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyCompanyPermissions();
      setMyPermissions(resp.myPermissions);
    } catch (err: any) {
      console.error('[MyCompanyProvider] fetchMyPermissions error:', err);
      setError(err.message || 'Failed to fetch myPermissions');
      setMyPermissions(null);
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
      console.error('[MyCompanyProvider] fetchMyInvitations error:', err);
      setError(err.message || 'Failed to fetch myInvitations');
      setMyInvitations(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  //-----------------------------Subscribe to "company" channel once--------------------------------
  useEffect(() => {
    if (!connected) return;
    if (me?.userType === "company" && me.companyID) {
      const companyChannel = `company:${me.companyID}`;
      subscribeChannel(companyChannel);
      return () => {
        unsubscribeChannel(companyChannel);
      };
    }
  }, [connected, me?.userType, me?.companyID, subscribeChannel, unsubscribeChannel]);

  //-----------------------------Auto-fetch data once we know we are a "company" user------------------
  useEffect(() => {
    if (me?.userType === "company" && me.companyID) {
      fetchMyCompany();
      fetchMyWarehouses();
      fetchMyUsers();
      fetchMyRoles();
      fetchMyPermissions();
      fetchMyInvitations();
    } else {
      setMyCompany(null);
      setMyWarehouses(null);
      setMyUsers(null);
      setMyRoles(null);
      setMyPermissions(null);
      setMyInvitations(null);
    }
  }, [
      me,
      fetchMyCompany,
      fetchMyWarehouses,
      fetchMyRoles,
      fetchMyPermissions,
      fetchMyInvitations,
    ]);

  //---------------------------Listen to SSE events that indicate data change-------------------------
  useEffect(() => {
    if (!lastMessage) return;
    console.log('[MyCompanyProvider] SSE lastMessage =>', lastMessage)
    if (me?.userType !== 'company' || !me.companyID) {
      console.log('[MyCompanyProvider] skipping because user is not a "company" user');
      return;
    }
    const { event, channel } = lastMessage;
    const myChannel = `company:${me.companyID}`;
    console.log('[MyCompanyProvider] myChannel=', myChannel, ' message.channel', channel);
    if (channel !== myChannel) return;
    console.log('[MyCompanyProvider] event =>', event);
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
      case 'RoleCreated':
      case 'RoleUpdated':
      case 'RoleDeleted':
      case 'RoleAssignmentChanged':
        fetchMyRoles();
        fetchMyUsers();
        break;
      case 'InvitationCreated':
      case 'InvitationCanceled':
      case 'InvitationDeleted':
      case 'InvitationAccepted':
      case 'InvitationExpired':
      case 'InvitationResent':
        fetchMyInvitations();
        fetchMyUsers();
        break;
      default:
        break;
    }
  }, [
      lastMessage,
      me?.userType,
      me?.companyID,
      fetchMyCompany,
      fetchMyWarehouses,
      fetchMyUsers,
      fetchMyRoles,
      fetchMyInvitations,
    ]);
  
  const value: MyCompanyContextValue = {
    myCompany,
    myWarehouses,
    myUsers,
    myRoles,
    myPermissions,
    myInvitations,
    loading,
    error,
    fetchMyCompany,
    fetchMyWarehouses,
    fetchMyUsers,
    fetchMyRoles,
    fetchMyPermissions,
    fetchMyInvitations,
  };

  return (
    <MyCompanyContext.Provider value={value}>
      {children}
    </MyCompanyContext.Provider>
  );
}












