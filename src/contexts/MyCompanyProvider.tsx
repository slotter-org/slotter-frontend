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

  const mergeCompany = useCallback((updated: Company) => {
    setMyCompany((old) => {
      if (!old) return updated;
      return updated;
    });
  }, []);
  const mergeWarehouse = useCallback((wh: Warehouse) => {
    setMyWarehouses((old) => {
      if (!old) return [wh];
      const index = old.findIndex((x) => x.id === wh.id);
      if (index < 0) {
        return [...old, wh];
      }
      const clone = [...old];
      clone[index] = { ...clone[index], ...wh };
      return clone;
    });
  }, []);
  const removeWarehouse = useCallback((id: string) => {
    setMyWarehouses((old) => old?.filter((w) => w.id !== id) || null);
  }, []);
  const mergeUser = useCallback((u: User) => {
    setMyUsers((old) => {
      if (!old) return [u];
      const index = old.findIndex((x) => x.id === u.id);
      if (index < 0) {
        return [...old, u];
      }
      const clone = [...old];
      clone[index] = { ...clone[index], ...u };
      return clone;
    });
  }, []);
  const removeUser = useCallback((id: string) => {
    setMyUsers((old) => old?.filter((u) => u.id !== id) || null);
  }, []);
  const mergeRole = useCallback((r: Role) => {
    setMyRoles((old) => {
      if (!old) return [r];
      const index = old.findIndex((x) => x.id === r.id);
      if (index < 0) {
        return [...old, r];
      }
      const clone = [...old];
      clone[index] = { ...clone[index], ...r };
      return clone;
    });
  }, []);
  const removeRole = useCallback((id: string) => {
    setMyRoles((old) => old?.filter((r) => r.id !== id) || null);
  }, []);
  const mergeInvitation = useCallback((inv: Invitation) => {
    setMyInvitations((old) => {
      if (!old) return [inv];
      const index = old.findIndex((x) => x.id === inv.id);
      if (index < 0) {
        return [...old, inv];
      }
      const clone = [...old];
      clone[index] = { ...clone[index], ...inv };
      return clone
    });
  }, []);
  const removeInvitation = useCallback((id: string) => {
    setMyInvitations((old) => old?.filter((i) => i.id !== id) || null);
  }, []);

  const eventHandlers: Record<string, (payload: any) => void> = {
    CompanyNameChanged: (co) => {
      mergeCompany(co);
    },
    CompanyAvatarUpdated: (co) => {
      mergeCompany(co);
    },
    CompanyDeleted: () => {
      setMyCompany(null);
    },
    WarehouseCreated: (wh) => {
      mergeWarehouse(wh);
    },
    WarehouseNameChanged: (wh) => {
      mergeWarehouse(wh);
    },
    WarehouseDeleted: (wh) => {
      removeWarehouse(wh.id);
    },
    UserJoined: (u) => {
      mergeUser(u);
    },
    UserLeft: (u) => {
      removeUser(u.id);
    },
    UserAvatarUpdated: (u) => {
      mergeUser(u);
    },
    UserNameChanged: (u) => {
      mergeUser(u);
    },
    UserRoleUpdated: (u) => {
      mergeUser(u);
    },
    RoleCreated: (r) => {
      mergeRole(r);
    },
    RoleUpdated: (r) => {
      mergeRole(r);
    },
    RoleDeleted: (r) => {
      removeRole(r.id);
    },
    RoleAssignmentChanged: (r) => {
      mergeRole(r);
    },
    InvitationCreated: (inv) => {
      mergeInvitation(inv);
    },
    InvitationCanceled: (inv) => {
      mergeInvitation(inv);
    },
    InvitationDeleted: (inv) => {
      removeInvitation(inv.id);
    },
    InvitationAccepted: (inv) => {
      mergeInvitation(inv);
    },
    InvitationExpired: (inv) => {
      mergeInvitation(inv);
    },
    InvitationResent: (inv) => {
      mergeInvitation(inv);
    },
  };

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
    const { event, channel, data } = lastMessage;
    const myChannel = `company:${me.companyID}`;
    console.log('[MyCompanyProvider] myChannel=', myChannel, ' message.channel', channel);
    if (channel !== myChannel) return;
    console.log('[MyCompanyProvider] event =>', event);
    const handler = eventHandlers[event];
    if (handler) {
      handler(data);
    } else {
      console.log('[MyCompanyProvider] unhandled event =>', event, data);
    }
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

