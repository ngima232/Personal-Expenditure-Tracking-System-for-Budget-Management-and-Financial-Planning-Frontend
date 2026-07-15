import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper text-center">
      <p className="font-display text-6xl text-text-ink">404</p>
      <p className="mt-2 text-sm text-text-muted">This page doesn't exist in the ledger.</p>
      <Link to="/" className="mt-4 text-sm text-brand hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
