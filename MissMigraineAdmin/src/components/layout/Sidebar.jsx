import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Globe,
  Settings,
  LogOut,
} from 'lucide-react';
import { ConfirmModal } from '../ui/Modal';

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', Icon: Users },
  { to: '/logs', label: 'System Logs', Icon: FileText },
  { to: '/content', label: 'Educational Content', Icon: BookOpen },
  { to: '/api', label: 'API Monitoring', Icon: Globe },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setConfirmOpen(false);
    navigate('/login');
  }

  return (
    <>
      <aside className="fixed top-4 left-4 bottom-4 w-64 rounded-[24px] bg-surface flex flex-col p-5 border border-border shadow-2xl shadow-background/60 z-20">
        
        {/* Brand */}
        <div className="px-2 pt-2 pb-8 border-b border-border/60">
          <h1 className="font-reem text-2xl text-text-primary leading-tight">
            MissMigraine
          </h1>
          <p className="font-plein-light text-[11px] text-text-muted mt-1.5 uppercase tracking-[0.15em]">
            Admin Portal
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 mt-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-plein-medium text-base transition-colors ${
                  isActive
                    ? 'bg-brand text-background shadow-lg shadow-brand/20'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                }`
              }
            >
              <item.Icon size={20} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-border/60">
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-wisteria-800 px-4 py-3.5 font-plein-medium text-base text-text-primary hover:bg-danger/15 hover:text-danger transition-colors"
          >
            <LogOut size={20} strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      {/* Logout confirmation */}
      <ConfirmModal
        open={confirmOpen}
        title="Log out?"
        message="You'll be signed out of the admin portal. You can log back in any time."
        confirmLabel={signingOut ? 'Logging out…' : 'Log out'}
        danger
        onClose={() => !signingOut && setConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}