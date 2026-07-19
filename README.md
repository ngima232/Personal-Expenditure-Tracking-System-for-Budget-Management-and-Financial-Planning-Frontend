# Pest — Personal Expenditure Tracking system (Frontend)

React + Vite + Tailwind frontend for the Personal Expenditure Tracking System

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend's base URL
npm run dev
```

The app runs at `http://localhost:5173` by default.



## Structure

```
src/
  api/            fetch client + one function per backend resource
  context/        AuthContext (session, login/register/logout)
  components/     shared UI primitives (ui.jsx) + app layout/nav (Layout.jsx)
  pages/          one file per route (Dashboard, Transactions, Budgets, SavingsGoals, Categories, Login, Register)
  utils/          currency/date formatting helpers
```
