import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { useSSEContext, SSEMessage } from '@/contexts/SSEProvider';

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

  // ------------------------------ Fetch Helpers --------------------------------------

  const fetchMyCompany = useCallback(async () => {
    if (!me?.companyID) {
      setMyCompany(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { myCompany } = await getMyCompany();
      setMyCompany(myCompany);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch company');
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
      const { myWarehouses } = await getMyCompanyWarehouses();
      setMyWarehouses(myWarehouses);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch warehouses');
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
      const { myUsers } = await getMyCompanyUsers();
      setMyUsers(myUsers);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch users');
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
      const { myRoles } = await getMyCompanyRoles();
      setMyRoles(myRoles);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch roles');
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
      const { myPermissions } = await getMyCompanyPermissions();
      setMyPermissions(myPermissions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch permissions');
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
      const { myInvitations } = await getMyCompanyInvitations();
      setMyInvitations(myInvitations);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch invitations');
      setMyInvitations(null);
    } finally {
      setLoading(false);
    }
  }, [me?.companyID]);

  // ------------------------------ Merge Helpers with Bail-out --------------------------------------

  const mergeCompany = useCallback((incoming: Company) => {
    setMyCompany(old =>
      old &&
      old.id === incoming.id &&
      old.name === incoming.name &&
      old.avatarURL === incoming.avatarURL
        ? old
        : incoming
    );
  }, []);

  const mergeWarehouse = useCallback((incoming: Warehouse) => {
    setMyWarehouses(old => {
      if (!old) return [incoming];
      const idx = old.findIndex(w => w.id === incoming.id);
      if (idx === -1) return [...old, incoming];
      const existing = old[idx];
      if (
        existing.name === incoming.name &&
        existing.location === incoming.location
      ) {
        return old;
      }
      const next = [...old];
      next[idx] = { ...existing, ...incoming };
      return next;
    });
  }, []);

  const removeWarehouse = useCallback((id: string) => {
    setMyWarehouses(old => old?.filter(w => w.id !== id) || null);
  }, []);

  const mergeUser = useCallback((incoming: User) => {
    setMyUsers(old => {
      if (!old) return [incoming];
      const idx = old.findIndex(u => u.id === incoming.id);
      if (idx === -1) return [...old, incoming];
      const existing = old[idx];
      if (
        existing.firstName === incoming.firstName &&
        existing.lastName === incoming.lastName &&
        existing.avatarURL === incoming.avatarURL &&
        existing.roleId === incoming.roleId
      ) {
        return old;
      }
      const next = [...old];
      next[idx] = { ...existing, ...incoming };
      return next;
    });
  }, []);

  const removeUser = useCallback((id: string) => {
    setMyUsers(old => old?.filter(u => u.id !== id) || null);
  }, []);

  const mergeRole = useCallback((incoming: Role) => {
    setMyRoles(old => {
      if (!old) return [incoming];
      const idx = old.findIndex(r => r.id === incoming.id);
      if (idx === -1) return [...old, incoming];
      const existing = old[idx];
      if (
        existing.name === incoming.name &&
        existing.description === incoming.description &&
        existing.avatarURL === incoming.avatarURL &&
        (existing.permissions?.length || 0) === (incoming.permissions?.length || 0) &&
        (existing.users?.length || 0) === (incoming.users?.length || 0)
      ) {
        return old;
      }
      const next = [...old];
      next[idx] = { ...existing, ...incoming };
      return next;
    });
  }, []);

  const removeRole = useCallback((id: string) => {
    setMyRoles(old => old?.filter(r => r.id !== id) || null);
  }, []);

  const mergeInvitation = useCallback((incoming: Invitation) => {
    setMyInvitations(old => {
      if (!old) return [incoming];
      const idx = old.findIndex(i => i.id === incoming.id);
      if (idx === -1) return [...old, incoming];
      const existing = old[idx];
      if (
        existing.email === incoming.email &&
        existing.status === incoming.status
      ) {
        return old;
      }
      const next = [...old];
      next[idx] = { ...existing, ...incoming };
      return next;
    });
  }, []);

  const removeInvitation = useCallback((id: string) => {
    setMyInvitations(old => old?.filter(i => i.id !== id) || null);
  }, []);

  // ------------------------------ Memoized SSE Handlers --------------------------------------

  const eventHandlers = useMemo(() => ({
    CompanyNameChanged:       mergeCompany,
    CompanyAvatarUpdated:     mergeCompany,
    CompanyDeleted:           () => setMyCompany(null),

    WarehouseCreated:         mergeWarehouse,
    WarehouseNameChanged:     mergeWarehouse,
    WarehouseDeleted:         (w: Warehouse) => removeWarehouse(w.id),

    UserJoined:               mergeUser,
    UserLeft:                 (u: User) => removeUser(u.id),
    UserAvatarUpdated:        mergeUser,
    UserNameChanged:          mergeUser,
    UserRoleUpdated:          mergeUser,

    RoleCreated:              mergeRole,
    RoleUpdated:              mergeRole,
    RoleDeleted:              (r: Role) => removeRole(r.id),
    RoleAssignmentChanged:    mergeRole,

    InvitationCreated:        mergeInvitation,
    InvitationCanceled:       mergeInvitation,
    InvitationDeleted:        (i: Invitation) => removeInvitation(i.id),
    InvitationAccepted:       mergeInvitation,
    InvitationExpired:        mergeInvitation,
    InvitationResent:         mergeInvitation,
  }), [
    mergeCompany,
    mergeWarehouse, removeWarehouse,
    mergeUser, removeUser,
    mergeRole, removeRole,
    mergeInvitation, removeInvitation,
  ]);

  // ----------------------------- Subscribe / Auto‐fetch on mount --------------------------------

  useEffect(() => {
    if (connected && me?.userType === 'company' && me.companyID) {
      const ch = `company:${me.companyID}`;
      subscribeChannel(ch);
      return () => { unsubscribeChannel(ch); };
    }
  }, [connected, me?.userType, me?.companyID, subscribeChannel, unsubscribeChannel]);

  useEffect(() => {
    if (me?.userType === 'company' && me.companyID) {
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
    fetchMyUsers,
    fetchMyRoles,
    fetchMyPermissions,
    fetchMyInvitations,
  ]);

  // --------------------------- Deduped SSE Listener ----------------------------

  const lastProcessedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastMessage || me?.userType !== 'company' || !me.companyID) return;

    const key = [
      lastMessage.event,
      lastMessage.channel,
      JSON.stringify(lastMessage.data ?? {})
    ].join('|');

    if (key === lastProcessedRef.current) return;
    lastProcessedRef.current = key;

    const myChannel = `company:${me.companyID}`;
    if (lastMessage.channel !== myChannel) return;

    const handler = (eventHandlers as Record<string, any>)[lastMessage.event];
    if (handler) handler(lastMessage.data);
  }, [lastMessage, me?.userType, me?.companyID, eventHandlers]);

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

