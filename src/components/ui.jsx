import { X } from 'lucide-react';

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-brand text-paper-card hover:bg-brand-dark',
    ghost: 'bg-transparent text-text-ink hover:bg-line/40',
    danger: 'bg-transparent text-expense hover:bg-expense/10',
    gold: 'bg-gold text-ink hover:bg-gold-soft',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-expense">{error}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-sm border border-line bg-paper-card px-3 py-2 text-sm text-text-ink placeholder:text-text-faint focus:border-brand focus:outline-none ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-sm border border-line bg-paper-card px-3 py-2 text-sm text-text-ink focus:border-brand focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextArea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-sm border border-line bg-paper-card px-3 py-2 text-sm text-text-ink placeholder:text-text-faint focus:border-brand focus:outline-none ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-md border border-line bg-paper-card p-5 ${className}`}>{children}</div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-line/50 text-text-muted',
    income: 'bg-income/10 text-income',
    expense: 'bg-expense/10 text-expense',
    gold: 'bg-gold/15 text-gold',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Spinner({ className = '' }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-line border-t-brand ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line py-16 text-center">
      <p className="font-display text-lg text-text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-lg rounded-md border border-line bg-paper-card shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg text-text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-text-muted hover:bg-line/50 hover:text-text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-sm border border-expense/30 bg-expense/5 px-3 py-2 text-sm text-expense">
      {message}
    </div>
  );
}
