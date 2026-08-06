import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import SavingsGoals from './pages/SavingsGoals';
import Categories from './pages/Categories';
import Loans from './pages/Loans';
import Investments from './pages/investments';
import ExpenseForecast from './pages/ExpenseForecast'
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
       <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/savings-goals" element={<SavingsGoals />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/expense-forecast" element={<ExpenseForecast />} />
         
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
