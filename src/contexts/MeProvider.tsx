import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getMe, getMyRole } from '@/api/MeService';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { useSSEContext } from '@/contexts/SSEProvider';

interface MeContextType {
  me: User | null;
  myRole: Role | null;
  loading: boolean;
  error: string | null;
  fetchMeData: () => Promise<void>;
  fetchMyRole: () => Promise<void>;
}

export const MeContext = createContext<MeContextType>({
  me: null,
  myRole: null,
  loading: false,
  error: null,
  fetchMeData: async () => {},
  fetchMyRole: async () => {},
});

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<User | null>(null);
  const [myRole, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connected, lastMessage, subscribeChannel, unsubscribeChannel } = useSSEContext();

  const fetchMeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getMe();
      setMe(resp.me);
    } catch (err: any) {
      console.error('[MeProvider] fetchMeData error:', err);
      setError(err?.message || 'Failed to load user');
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyRole = useCallback(async () => {
    if (!me?.roleID) {
      setRole(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await getMyRole();
      setRole(resp.myRole || null);
    } catch (err: any) {
      console.error('[MeProvider] fetchMyRole error:', err);
      setError(err?.message || 'Failed to load role');
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [me?.roleID]);

  useEffect(() => {
    (async () => {
      await fetchMeData();
    })();
  }, [fetchMeData]);

  useEffect(() => {
    if (me?.roleID) {
      fetchMyRole();
    } else {
      setRole(null);
    }
  }, [me?.roleID, fetchMyRole])

  useEffect(() => {
    if (!connected) return;
    if (!me?.id) return;
    const userChan = 'user:' + me.id;
    subscribeChannel(userChan);
    return () => {
      unsubscribeChannel(userChan);
    };
  }, [connected, me?.id, subscribeChannel, unsubscribeChannel]);

  useEffect(() => {
    if (!lastMessage) return;
    const { event, channel } = lastMessage;
    if (!me?.id) return;
    const userChan = 'user:' + me.id;
    if (channel === userChan) {
      switch (event) {
        case 'UserAvatarUpdated':
        case 'UserNameChanged':
          fetchMeData();
          break;
        case 'UserRoleNameChanged':
          fetchMyRole();
          break;
        default:
          break;
      }
    }
  }, [lastMessage, me?.id, fetchMeData, fetchMyRole]);

  useEffect(() => {
    if (!lastMessage) return;
    const { event, channel } = lastMessage;
    if (!me.id | !me.companyID) return;
    const companyChan = 'company:' + me.companyID;
    if (channel === companyChan) {
      switch (event) {
        case 'CompanyRoleNameChanged':
        case 'CompanyRolePermissionsUpdated':
        case 'CompanyRoleDeleted':
        case 'CompanyRoleCreated':
          fetchMyRole();
          break;
      }
    }
  }, [lastMessage, me?.id, me?.companyID, fetchMyRole]);

  return (
    <MeContext.Provider
      value={{
        me,
        myRole,
        loading,
        error,
        fetchMeData,
        fetchMyRole,
      }}
    >
      {children}
    </MeContext.Provider>
  );
}


