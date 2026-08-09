import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  Banknote,
  HandCoins,
  LogOut,
  Bell,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/savings-goals', label: 'Savings Goals', icon: PiggyBank },
  { to: '/loans', label: 'Loans', icon: HandCoins },
  { to: '/investments', label: 'Investments', icon: Banknote },
  { to: '/expense-forecast', label: 'Forecast', icon: Wallet },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/savings-goals': 'Savings Goals',
  '/categories': 'Categories',
  '/loans': 'Loans',
  '/investments': 'Investments',
  '/expense-forecast': 'Expense Forecast',
};

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return <AppLayout />;
}

function TopNavbar({ user, logout }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'PETS';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-card px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-paper-card">
          <Wallet size={18} strokeWidth={2} />
        </span>
        <div>
          <p className="font-display text-base font-medium text-text-ink">PETS</p>
          <p className="text-[10px] uppercase tracking-wide text-text-faint">{pageTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-full p-2 text-text-muted hover:bg-paper"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-paper"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
              <User size={16} />
            </div>
            <span className="hidden text-sm font-medium text-text-ink sm:inline">{user?.name}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-line bg-paper-card py-1 shadow-lg">
              <div className="border-b border-line px-4 py-2">
                <p className="text-sm font-medium text-text-ink">{user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-muted transition-colors hover:bg-paper hover:text-expense"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <TopNavbar user={user} logout={logout} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex h-full w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-ink text-paper-card">
          <div className="px-6 py-6">
            <p className="font-display text-xl font-medium tracking-tight text-paper-card">PETS</p>
            <p className="mt-0.5 text-xs text-paper-card/50">Personal Expenditure Tracker</p>
          </div>

          <nav className="mt-2 flex-1 px-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'border-brand bg-ink-light text-paper-card'
                      : 'border-transparent text-paper-card/60 hover:bg-ink-light hover:text-paper-card'
                  }`
                }
              >
                <Icon size={17} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="shrink-0 border-t border-paper-card/10 px-4 py-4 sm:hidden">
            <p className="truncate px-2 text-sm text-paper-card/80">{user?.name}</p>
            <p className="truncate px-2 text-xs text-paper-card/40">{user?.email}</p>
          </div>
        </aside>

        <main className="h-full flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
