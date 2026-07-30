import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isUsingMockData } from '../../services/api';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <header className="header">
      <div>
        <p className="header__welcome">
          Welcome back, <strong>{user?.full_name?.split(' ')[0] || 'Admin'}</strong>
        </p>
        <p className="header__datetime">
          {now.toLocaleString()}
          {isUsingMockData() && (
            <span className="header__mock-badge"> · Demo data</span>
          )}
        </p>
      </div>
      <div className="header__right">
        <div className="header__avatar" title={user?.email}>
          {initials}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={async () => {
            await signOut();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
