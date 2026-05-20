import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// project imports
import { loginApi, logoutApi, registerApi, getMeApi } from 'api/auth';

// ==============================|| AUTH CONTEXT ||============================== //

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Rehydrate from cookie on every page load / refresh ──────────────────────
  useEffect(() => {
    getMeApi()
      .then((me) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setIsInitialized(true));
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const data = await loginApi(credentials);
      setUser(data.user ?? data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi().catch(() => {});
    setUser(null);
  }, []);

  const register = useCallback(async (userData, files) => {
    setIsLoading(true);
    try {
      const data = await registerApi(userData, files);
      setUser(data.user ?? data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitialized, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
