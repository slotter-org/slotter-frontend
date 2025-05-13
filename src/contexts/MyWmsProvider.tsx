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
import { Role } from '@/types/role';
import { Permission } from '@/types/permission';
import { Invitation } from '@/types/invitation';
import { MeContext } from './MeProvider';
import {
  getMyWms,
  getMyWmsCompanies,
  getMyWmsUsers,
  getMyWmsRoles,
  getMyWmsInvitations,
  getMyWmsPermissions,
} from '@/api/MyWmsService';
import { useSSEContext } from '@/contexts/SSEProvider';

interface MyWmsContextValue {
  myWms: Wms | null;
  myCompanies: Company[] | null;
  myUsers: User[] | null;
  myRoles: Role[] | null;
  myInvitations: Invitation[] | null;
  myPermissions: Permission[] | null;
  loading: boolean;
  error: string | null;
  fetchMyWms: () => Promise<void>;
  fetchMyCompanies: () => Promise<void>;
  fetchMyUsers: () => Promise<void>;
  fetchMyRoles: () => Promise<void>;
  fetchMyInvitations: () => Promise<void>;
  fetchMyPermissions: () => Promise<void>;
}

const MyWmsContext = createContext<MyWmsContextValue>({
  myWms: null,
  myCompanies: null,
  myUsers: null,
  myRoles: null,
  myInvitations: null,
  myPermissions: null,
  loading: false,
  error: null,
  fetchMyWms: async () => {},
  fetchMyCompanies: async () => {},
  fetchMyUsers: async () => {},
  fetchMyRoles: async () => {},
  fetchMyInvitations: async () => {},
  fetchMyPermissions: async () => {},
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
  const [myRoles, setMyRoles] = useState<Role [] | null>(null);
  const [myInvitations, setMyInvitations] = useState<Invitation[] | null>(null);
  const [myPermissions, setMyPermissions] = useState<Permission[] | null>(null);
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
      setMyCompanies(resp.myCompanies);
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
      setMyUsers(resp.myUsers);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyUsers error:', err);
      setError(err.message || 'Failed to fetch my wms users');
      setMyUsers(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  const fetchMyRoles = useCallback(async () => {
    if (!me?.wmsID) {
      setMyRoles(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWmsRoles();
      setMyRoles(resp.myRoles);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyRoles error:', err);
      setError(err.message || 'Failed to fetch my wms roles');
      setMyRoles(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  const fetchMyInvitations = useCallback(async () => {
    if (!me?.wmsID) {
      setMyInvitations(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWmsInvitations();
      setMyInvitations(resp.myInvitations);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyInvitations error:', err);
      setError(err.message || 'Failed to fetch my wms invitations');
      setMyInvitations(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  const fetchMyPermissions = useCallback(async () => {
    if (!me?.wmsID) {
      setMyPermissions(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyWmsPermissions();
      setMyPermissions(resp.myPermissions);
    } catch (err: any) {
      console.error('[MyWmsProvider] fetchMyPermissions error:', err);
      setError(err.message || 'Failed to fetch my wms permissions');
      setMyPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [me?.wmsID]);

  useEffect(() => {
    if (me?.userType === 'wms' && me.wmsID) {
      fetchMyWms();
      fetchMyCompanies();
      fetchMyUsers();
      fetchMyRoles();
      fetchMyInvitations();
      fetchMyPermissions();
    } else {
      setMyWms(null);
      setMyCompanies(null);
      setMyUsers(null);
      setMyRoles(null);
      setMyInvitations(null);
      setMyPermissions(null);
    }
  }, [me?.userType, me?.wmsID, fetchMyWms, fetchMyCompanies, fetchMyUsers, fetchMyRoles, fetchMyInvitations, fetchMyPermissions]);

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
        case 'UserRoleUpdated':
          fetchMyUsers();
          fetchMyRoles();
          break;
        case 'RoleCreated':
        case 'RoleUpdated':
        case 'RoleDeleted':
          fetchMyRoles();
          break;
        case 'RoleReassigned':
          fetchMyRoles();
          fetchMyUsers();
          break;
        case 'WmsInvitationCreated':
        case 'WmsInvitationDeleted':
        case 'WmsInvitationAccepted':
        case 'WmsInvitationCanceled':
        case 'WmsInvitationExpired':
        case 'WmsInvitationPending':
          fetchMyUsers();
          fetchMyInvitations();
        default:
          break;
      }
    }
  }, [lastMessage, me?.userType, me?.wmsID, fetchMyWms, fetchMyCompanies, fetchMyUsers, fetchMyRoles, fetchMyInvitations]);

  const value: MyWmsContextValue = {
    myWms,
    myCompanies,
    myUsers,
    myRoles,
    myInvitations,
    myPermissions,
    loading,
    error,
    fetchMyWms,
    fetchMyCompanies,
    fetchMyUsers,
    fetchMyRoles,
    fetchMyInvitations,
    fetchMyPermissions,
  };

  return (
    <MyWmsContext.Provider value={value}>
      {children}
    </MyWmsContext.Provider>
  );
}
