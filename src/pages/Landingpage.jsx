import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import currencies from "../utils/currencies";
import Select from "react-select";
import {
  ArrowUpRight,
  Wallet,
  PiggyBank,
  HandCoins,
  TrendingUp,
  Banknote,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TAPE_ENTRIES = [
  { label: 'Rent — August', amount: -1450, type: 'expense' },
  { label: 'Salary', amount: 3200, type: 'income' },
  { label: 'Groceries — Tesco', amount: -64.2, type: 'expense' },
  { label: 'Freelance invoice', amount: 480, type: 'income' },
  { label: 'Loan repayment — Priya', amount: 150, type: 'income' },
  { label: 'Electricity bill', amount: -88.5, type: 'expense' },
];

function formatAmount(n) {
  return `${n < 0 ? '−' : '+'}£${Math.abs(n).toFixed(2)}`;
}

function LedgerTape() {
  const entries = [...TAPE_ENTRIES, ...TAPE_ENTRIES];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-white/5">
      <div className="tape-track flex w-max gap-8 px-5 py-2.5">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs">
            <span className="text-white/40">{e.label}</span>
            <span className={e.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
              {formatAmount(e.amount)}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .tape-track { animation: tape-scroll 28s linear infinite; }
        @keyframes tape-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .tape-track { animation: none; } }
      `}</style>
    </div>
  );
}

const FEATURES = [
  { icon: Wallet, name: 'Budgets' },
  { icon: PiggyBank, name: 'Savings goals' },
  { icon: HandCoins, name: 'Loans' },
  { icon: Banknote, name: 'Investments' },
  { icon: TrendingUp, name: 'Forecasting' },
];

function AuthModal({ mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: "GBP" });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-white/10 bg-ink p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl text-paper-card">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Password</label>
            <input
              type="password"
              required
              minLength={isSignUp ? 8 : undefined}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
            />
          </div>
          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">Currency</label>
              <Select
                options={currencies}
                isSearchable
                placeholder="Select your currency"
                value={currencies.find(
                  (currency) => currency.value === form.currency
                )}
                onChange={(selected) =>
                  setForm({
                    ...form,
                    currency: selected.value,
                  })
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#1E293B",
                    borderColor: "#334155",
                    color: "#fff",
                    minHeight: "42px",
                    borderRadius: "0.375rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#1E293B",
                    color: "#fff",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? "#334155"
                      : "#1E293B",
                    color: "#fff",
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#fff",
                  }),
                  input: (base) => ({
                    ...base,
                    color: "#fff",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#94A3B8",
                  }),
                }}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-light disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/40">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => onSwitchMode(isSignUp ? 'signin' : 'signup')}
            className="text-brand-light hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [authModal, setAuthModal] = useState(null);

  return (
    <div className="h-screen w-screen overflow-hidden bg-ink font-sans text-text-ink">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className={`relative flex h-full flex-col transition-[filter] duration-200 ${
          authModal ? 'pointer-events-none blur-md' : ''
        }`}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/landing-bg.jpg)' }}
          aria-hidden="true"
        />
        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-ink/95 via-ink/85 to-indigo-950/90"
          aria-hidden="true"
        />

        {/* Nav */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-medium tracking-tight text-paper-card">PETS</span>
            <span className="hidden text-xs text-white/40 sm:inline">Personal Expenditure Tracking System</span>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setAuthModal('signin')}
              className="rounded-md px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              Sign in
            </button>
            <button
              onClick={() => setAuthModal('signup')}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Sign up
            </button>
          </nav>
        </header>

        {/* Hero */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-light">Every pound, one page</p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-medium leading-[1.12] text-paper-card sm:text-5xl">
            Kept like a proper ledger,
            <br className="hidden sm:block" /> not a pile of screenshots.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/55 sm:text-base">
            Budgets that track real spend, savings goals with a history, and a forecast of what
            next month costs you — before it happens.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setAuthModal('signup')}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Get started free <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => setAuthModal('signin')}
              className="rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              Sign in
            </button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-white/35">
            {FEATURES.map(({ icon: Icon, name }) => (
              <div key={name} className="flex items-center gap-1.5 text-xs">
                <Icon size={14} strokeWidth={1.75} />
                <span className="hidden sm:inline">{name}</span>
              </div>
            ))}
          </div>
        </main>

        {/* Ledger tape footer strip */}
        <div className="relative z-10 shrink-0">
          <LedgerTape />
        </div>
      </div>

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitchMode={setAuthModal} />
      )}
    </div>
  );
}
