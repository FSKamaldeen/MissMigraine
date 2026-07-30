import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSessionUser, signIn as apiSignIn, signOut as apiSignOut } from '../services/api';
import { MOCK_ADMIN } from '../data/mockData';

const AuthContext = createContext(null);

const MOCK_SESSION_KEY = 'mm_admin_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessionUser = await getSessionUser();
      if (!cancelled && sessionUser) {
        setUser(sessionUser);
        setLoading(false);
        return;
      }
      const stored = sessionStorage.getItem(MOCK_SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!cancelled) setUser(parsed);
        } catch {
          sessionStorage.removeItem(MOCK_SESSION_KEY);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { user: signedIn, error } = await apiSignIn(email, password);
    if (error) return { error };
    setUser(signedIn);
    sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(signedIn));
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    sessionStorage.removeItem(MOCK_SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      isAdmin: user?.role === 'admin',
      demoHint: MOCK_ADMIN.email,
    }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
