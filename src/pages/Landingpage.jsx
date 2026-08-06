import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowUpRight,
  Wallet,
  PiggyBank,
  HandCoins,
  TrendingUp,
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
    <div className="relative overflow-hidden border-y border-white/10 bg-black/20">
      <div className="tape-track flex w-max gap-8 px-5 py-2.5">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs">
            <span className="text-white/40">{e.label}</span>
            <span className={e.type === 'income' ? 'text-[#5FAE86]' : 'text-[#D98C82]'}>
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
  { icon: TrendingUp, name: 'Forecasting' },
];

function AuthModal({ mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-md border border-white/10 bg-[#152420] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl text-[#F8F9F5]">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-sm border border-[#D98C82]/30 bg-[#D98C82]/10 px-3 py-2 text-sm text-[#D98C82]">
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
                className="w-full rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#C9A24B] focus:outline-none"
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
              className="w-full rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#C9A24B] focus:outline-none"
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
              className="w-full rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#C9A24B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-sm bg-[#C9A24B] px-4 py-2.5 text-sm font-medium text-[#152420] transition-colors hover:bg-[#E4CE93] disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/40">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => onSwitchMode(isSignUp ? 'signin' : 'signup')}
            className="text-[#C9A24B] hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [authModal, setAuthModal] = useState(null); // null | 'signin' | 'signup'

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#152420] font-sans text-[#1B231F]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Page content — blurred and inert while the auth modal is open */}
      <div
        className={`flex h-full flex-col transition-[filter] duration-200 ${
          authModal ? 'pointer-events-none blur-md' : ''
        }`}
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,162,75,0.10), transparent 60%),
            repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 42px),
            linear-gradient(160deg, #1A2D27 0%, #152420 45%, #101C18 100%)
          `,
        }}
      >
        {/* Nav */}
        <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-medium tracking-tight text-[#F8F9F5]">Ledger</span>
            <span className="hidden text-xs text-white/40 sm:inline">personal expenditure</span>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setAuthModal('signin')}
              className="rounded-sm px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A24B]"
            >
              Sign in
            </button>
            <button
              onClick={() => setAuthModal('signup')}
              className="rounded-sm bg-[#C9A24B] px-4 py-2 text-sm font-medium text-[#152420] transition-colors hover:bg-[#E4CE93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24B]"
            >
              Sign up
            </button>
          </nav>
        </header>

        {/* Hero — fills remaining space, vertically centered, no page scroll */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A24B]">Every pound, one page</p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-medium leading-[1.12] text-[#F8F9F5] sm:text-5xl">
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
              className="inline-flex items-center gap-2 rounded-sm bg-[#C9A24B] px-5 py-3 text-sm font-medium text-[#152420] transition-colors hover:bg-[#E4CE93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24B]"
            >
              Get started free <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => setAuthModal('signin')}
              className="rounded-sm border border-white/20 px-5 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A24B]"
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
        <div className="shrink-0">
          <LedgerTape />
        </div>
      </div>

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitchMode={setAuthModal} />
      )}
    </div>
  );
}