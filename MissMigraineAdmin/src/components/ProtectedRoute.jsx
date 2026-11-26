import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ProtectedRoute() {
  const [state, setState] = useState('checking');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setState('unauthorized');
        return;
      }
      
      // Check the app_metadata for the admin role
      const roles = session.user?.app_metadata?.roles;
      const singleRole = session.user?.app_metadata?.role;
      const isAdmin =
        (Array.isArray(roles) && roles.includes('admin')) ||
        singleRole === 'admin';

      setState(isAdmin ? 'authorized' : 'unauthorized');
    });
  }, []);

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-plein text-text-muted">Checking session…</p>
      </div>
    );
  }

  if (state === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}