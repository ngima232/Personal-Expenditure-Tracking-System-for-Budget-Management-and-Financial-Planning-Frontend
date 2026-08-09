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
  ShieldCheck,
  Globe,
  Sparkles
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
    <div className="relative overflow-hidden border-t border-white/10 bg-slate-950/60 backdrop-blur-md">
      <div className="tape-track flex w-max gap-8 px-5 py-3">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2.5 whitespace-nowrap font-mono text-xs">
            <span className="text-slate-400">{e.label}</span>
            <span className={`font-semibold ${e.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatAmount(e.amount)}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .tape-track { animation: tape-scroll 32s linear infinite; }
        .tape-track:hover { animation-play-state: paused; }
        @keyframes tape-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .tape-track { animation: none; } }
      `}</style>
    </div>
  );
}

const FEATURES = [
  { icon: Wallet, name: 'Smart Budgets' },
  { icon: PiggyBank, name: 'Savings Goals' },
  { icon: HandCoins, name: 'Informal Loans' },
  { icon: Banknote, name: 'Investments' },
  { icon: TrendingUp, name: 'AI Forecasting' },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Password</label>
            <input
              type="password"
              required
              minLength={isSignUp ? 8 : undefined}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Base Currency</label>
              <Select
                options={currencies}
                isSearchable
                placeholder="Select your preferred currency"
                value={currencies.find((c) => c.value === form.currency)}
                onChange={(selected) => setForm({ ...form, currency: selected.value })}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    color: "#fff",
                    minHeight: "42px",
                    borderRadius: "0.5rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#0F172A",
                    color: "#fff",
                    borderRadius: "0.5rem",
                    border: "1px solid #334155"
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#1E293B" : "#0F172A",
                    color: "#fff",
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({ ...base, color: "#fff" }),
                  input: (base) => ({ ...base, color: "#fff" }),
                  placeholder: (base) => ({ ...base, color: "#94A3B8" }),
                }}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/50 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/50">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => onSwitchMode(isSignUp ? 'signin' : 'signup')}
            className="text-emerald-400 font-medium hover:underline"
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
    <div className="h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className={`relative flex h-full flex-col transition-[filter] duration-300 ${
          authModal ? 'pointer-events-none blur-md' : ''
        }`}
      >
        {/* Dynamic Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url(/landing-bg.png)' }}
          aria-hidden="true"
        />
        {/* Glow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-emerald-950/70" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Navigation */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-6 sm:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold font-serif">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-white">PETS</span>
              <span className="hidden text-[10px] tracking-wider uppercase text-slate-400 sm:inline">Personal Expenditure Tracking</span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setAuthModal('signin')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign in
            </button>
            <button
              onClick={() => setAuthModal('signup')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
            >
              Get Started
            </button>
          </nav>
        </header>

        {/* Hero Section */}
      {/* Hero Section */}
<main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md">
    <Sparkles size={13} className="text-emerald-400" />
    <span>Smart Financial Intelligence & Forecasting</span>
  </div>

  {/* Heading */}
  <h1 className="mt-6 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
    Master your wealth with total clarity & predictive forecasting.
  </h1>

  {/* Subheading */}
  <p className="mt-5 max-w-xl text-base text-slate-300/80 sm:text-lg">
    Effortlessly control your income, budgets, loans, and investments in your preferred currency. Forecast your financial future powered by your real transaction trends.
  </p>

  {/* CTAs */}
  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
    <button
      onClick={() => setAuthModal('signup')}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:scale-[1.02]"
    >
      Start Tracking Free <ArrowUpRight size={16} />
    </button>
    <button
      onClick={() => setAuthModal('signin')}
      className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white hover:border-white/25"
    >
      Explore Dashboard
    </button>
  </div>

  {/* Features Pill Strip */}
  <div className="mt-12 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
    {FEATURES.map(({ icon: Icon, name }) => (
      <div 
        key={name} 
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10"
      >
        <Icon size={14} className="text-emerald-400" />
        <span>{name}</span>
      </div>
    ))}
  </div>
</main>
        {/* Ledger Tape Footer */}
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