# Ledger — Personal Expenditure Tracker (Frontend)

React + Vite + Tailwind frontend for the Personal Expenditure Tracking System, wired to the
Category / Transaction / Budget / SavingsGoal API you already have on the backend.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend's base URL
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Assumptions about the backend

This frontend expects the following endpoints, matching your existing controller/route pattern:

- `POST /auth/login` → `{ data: { token, user } }`
- `POST /auth/register` → `{ data: { token, user } }`
- `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`
- `GET /transactions`, `GET /transactions/summary`, `POST /transactions`, `PATCH /transactions/:id`, `DELETE /transactions/:id`
- `GET /budgets`, `GET /budgets/:id/status`, `POST /budgets`, `PATCH /budgets/:id`, `DELETE /budgets/:id`
- `GET /savings-goals`, `POST /savings-goals`, `POST /savings-goals/:id/contributions`, `PATCH /savings-goals/:id`, `DELETE /savings-goals/:id`

All list endpoints are expected to return `{ data: { count, rows }, metadata }`, matching your
`successResponseData` pagination shape. If your `auth` routes live under a different path or
return a different shape (e.g. no `/auth/me`), update `src/api/index.js` and
`src/context/AuthContext.jsx` accordingly — those are the only two files that assume that shape.

If your API doesn't send CORS headers for `http://localhost:5173`, you'll need to enable CORS on
the backend for local development.

## Structure

```
src/
  api/            fetch client + one function per backend resource
  context/        AuthContext (session, login/register/logout)
  components/     shared UI primitives (ui.jsx) + app layout/nav (Layout.jsx)
  pages/          one file per route (Dashboard, Transactions, Budgets, SavingsGoals, Categories, Login, Register)
  utils/          currency/date formatting helpers
```

## Design notes

- Money is always rendered in a monospaced, tabular-figure font (`.figure` class) so amounts line
  up like a real ledger.
- Colors: deep ink-teal sidebar, warm paper background, sage green for income, brick red for
  expenses, gold for goals/budget accents — defined in `tailwind.config.js`.
- Dashboard leads with the current month's net balance as the hero number, per the "big number as
  thesis" approach for a finance app.
