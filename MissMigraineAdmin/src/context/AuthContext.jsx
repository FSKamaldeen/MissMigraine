import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { logAdminAction } from '../services/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client is null. Check your .env file.');
      setLoading(false);
      return;
    }

    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    if (!supabase) {
      return { error: { message: 'Supabase client not initialized' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { error };

    // Verify admin role
    const roles = data.user?.app_metadata?.roles;
    const singleRole = data.user?.app_metadata?.role;
    const isAdmin =
      (Array.isArray(roles) && roles.includes('admin')) ||
      singleRole === 'admin';

    if (!isAdmin) {
      await supabase.auth.signOut();
      return {
        error: { message: 'Access denied. Administrator privileges required.' },
      };
    }

    // System log
    await logAdminAction('Login', null, { status: 'success' });

    return { error: null, user: data.user };
  }

  async function signOut() {
    if (!supabase) return;

    // System log
    await logAdminAction('Logout', null, { status: 'success' });
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  const value = useMemo(
    () => ({ user, session, loading, signIn, signOut }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}