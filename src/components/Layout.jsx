import { NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/savings-goals', label: 'Savings Goals', icon: PiggyBank },
  { to: '/categories', label: 'Categories', icon: Tags },
];

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppLayout />;
}

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 shrink-0 flex-col bg-ink text-paper-card">
        <div className="px-6 py-6">
          <p className="font-display text-xl font-medium tracking-tight text-paper-card">PETS</p>
          <p className="mt-0.5 text-xs text-paper-card/50">Personal Expenditure Tracking System</p>
        </div>

        <nav className="mt-2 flex-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'border-gold bg-ink-light text-paper-card'
                    : 'border-transparent text-paper-card/60 hover:bg-ink-light hover:text-paper-card'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-paper-card/10 px-4 py-4">
          <p className="truncate px-2 text-sm text-paper-card/80">{user?.name}</p>
          <p className="truncate px-2 text-xs text-paper-card/40">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-paper-card/60 hover:bg-ink-light hover:text-paper-card"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
