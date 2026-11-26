import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/logs': 'System Logs',
  '/content': 'Educational Content',
  '/api': 'API Monitoring',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div className="sticky top-4 z-10 px-8 mb-6">
      <header className="h-16 flex items-center rounded-[20px] bg-surface border border-border px-8 shadow-lg shadow-background/40">
        <h1 className="font-reem text-2xl text-text-primary">
          {pageTitle}
        </h1>
      </header>
    </div>
  );
}