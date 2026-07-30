import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/logs', label: 'System Logs', icon: '📋' },
  { to: '/content', label: 'Educational Content', icon: '📚' },
  { to: '/api', label: 'API Monitoring', icon: '🌐' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">MissMigraine Admin</div>
      <nav className="sidebar__nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="sidebar__logout btn btn--ghost" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
