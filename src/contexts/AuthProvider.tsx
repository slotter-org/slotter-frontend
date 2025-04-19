import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { loginUser, logoutUser, refreshToken, registerUser } from '@/api/AuthService';
import {
  setTokens,
  clearTokens,
  getToken,
  getRefreshToken,
  setExpiresAt,
  getExpiresAt,
} from '@/services/StorageService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    new_company_name?: string,
    new_wms_name?: string,
    company_id?: string,
    wms_id?: string
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
  register: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const refreshTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    clearTokens();
    if (refreshTimerId.current) {
      clearTimeout(refreshTimerId.current);
      refreshTimerId.current = null;
    }
    setIsAuthenticated(false);
  }, []);

  const doSessionLogin = useCallback(
    (accessToken: string, newRefreshToken: string, expiresIn: number) => {
      setTokens(accessToken, newRefreshToken);
      const expiresAt = Date.now() + expiresIn * 1000;
      setExpiresAt(expiresAt);
      setIsAuthenticated(true);
      if (refreshTimerId.current) {
        clearTimeout(refreshTimerId.current);
      }
      const delayBeforeRefresh = expiresAt - Date.now() - 30000;
      const safeDelay = Math.max(0, delayBeforeRefresh);
      refreshTimerId.current = setTimeout(() => {
        refreshTokens();
      }, safeDelay);
    },
    [clearSession]
  );

  const refreshTokens = useCallback(async () => {
    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token in localStorage');
      }
      const { access_token, refresh_token, expires_in } = await refreshToken();
      doSessionLogin(access_token, refresh_token, expires_in);
    } catch (err) {
      console.error('[AuthProvider] Token refresh failed:', err);
      clearSession();
    }
  }, [clearSession, doSessionLogin]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token, refresh_token, expires_in } = await loginUser({
        email,
        password,
      });
      doSessionLogin(access_token, refresh_token, expires_in);
    },
    [doSessionLogin]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('[AuthProvider] Logout error (ignored):', err)
    }
    clearSession();
  }, [clearSession]);

  const register = useCallback(
    async (
      email: string,
      password: string,
      first_name: string,
      last_name: string,
      new_company_name?: string,
      new_wms_name?: string,
      company_id?: string,
      wms_id?: string,
    ) => {
      await registerUser({
        email,
        password,
        first_name,
        last_name,
        new_company_name,
        new_wms_name,
        company_id,
        wms_id,
      });
    },
    []
  );


    /**
   * On mount: If tokens are in localStorage, schedule a refresh (or refresh immediately if near expiry).
   */
  useEffect(() => {
    const existingToken = getToken();
    const existingExpiresAt = getExpiresAt();

    if (existingToken && existingExpiresAt) {
      // Is there enough time left before expiry to wait, or do we refresh right now?
      const now = Date.now();
      const timeLeft = existingExpiresAt - now - 30000; // 30s early
      if (timeLeft > 0) {
        // Schedule a timer
        refreshTimerId.current = setTimeout(() => {
          refreshTokens();
        }, timeLeft);
      } else {
        // Already expired or near expiry => refresh immediately
        refreshTokens();
      }
      setIsAuthenticated(true);
    }

    return () => {
      // Clear any leftover timer
      if (refreshTimerId.current) {
        clearTimeout(refreshTimerId.current);
      }
    };
  }, [refreshTokens]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, refresh: refreshTokens, register }}>
      {children}
    </AuthContext.Provider>
  );
}

