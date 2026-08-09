import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { transactionsApi, budgetsApi } from '../api';
import { formatCurrency, formatDate, titleCase } from '../utils/format';
import { Card, Spinner, EmptyState, Badge } from '../components/ui';

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [summaryRes, txRes, budgetRes, spendingRes] = await Promise.all([
          transactionsApi.summary({ startDate: startOfMonth() }),
          transactionsApi.list({ limit: 6, sort: 'date', order: 'desc', page: 1 }),
          budgetsApi.list({ limit: 4, isActive: true, page: 1 }),
          transactionsApi.getCategorySpending({ startDate: startOfMonth() }),
        ]);
        if (!mounted) return;
        setSummary(summaryRes.data);
        setRecent(txRes.data?.rows || []);
        setBudgets(budgetRes.data?.rows || []);
        setCategorySpending(spendingRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const net = summary?.netBalance ?? 0;
  const income = summary?.totalIncome ?? 0;
  const expense = summary?.totalExpense ?? 0;

  // Prepare data for the area chart (recent activity)
  const chartData = recent
    .slice()
    .reverse()
    .map((t) => ({
      date: formatDate(t.date),
      amount: t.type === 'expense' ? -t.amount : t.amount,
    }));

  // Prepare data for the pie chart (category spending)
  const pieData = [...categorySpending]
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.category.name,
      value: item.total,
      color: item.category.color || '#4F46E5', // fallback colour
    }));

  const totalSpending = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          This month
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <h1 className="figure font-display text-5xl font-medium text-text-ink">
            {formatCurrency(net)}
          </h1>
          <span
            className={`flex items-center text-sm font-medium ${
              net >= 0 ? 'text-income' : 'text-expense'
            }`}
          >
            {net >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            Net balance
          </span>
        </div>
        <div className="ledger-rule mt-6" />
      </header>

      {/* Income / Expense summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Income
            </p>
            <p className="figure mt-1 text-2xl text-income">
              {formatCurrency(income)}
            </p>
          </div>
          <TrendingUp className="text-income" size={28} strokeWidth={1.5} />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Expenses
            </p>
            <p className="figure mt-1 text-2xl text-expense">
              {formatCurrency(expense)}
            </p>
          </div>
          <TrendingDown className="text-expense" size={28} strokeWidth={1.5} />
        </Card>
      </div>

      {/* Recent activity + Active budgets row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 font-display text-base text-text-ink">
            Recent activity
          </p>
          {chartData.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first income or expense to see trends here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    borderColor: '#E2E8F0',
                    fontSize: 12,
                    fontFamily: 'Inter',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fill="url(#netGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <p className="mb-4 font-display text-base text-text-ink">
            Active budgets
          </p>
          {budgets.length === 0 ? (
            <p className="text-sm text-text-muted">No active budgets set.</p>
          ) : (
            <ul className="space-y-4">
              {budgets.map((b) => (
                <li key={b._id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-text-ink">
                      {b.category?.name || 'Category'}
                    </span>
                    <span className="figure text-text-muted">
                      {formatCurrency(b.limitAmount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: '45%' }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Latest transactions + Spending by category row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-4 font-display text-base text-text-ink">
            Latest transactions
          </p>
          {recent.length === 0 ? (
            <EmptyState
              title="Nothing logged yet"
              description="Transactions you add will show up here."
            />
          ) : (
            <div className="divide-y divide-line">
              {recent.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-text-ink">
                      {t.description || t.category?.name || 'Transaction'}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {formatDate(t.date)} · {t.category?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={t.type === 'income' ? 'income' : 'expense'}>
                      {titleCase(t.type)}
                    </Badge>
                    <span
                      className={`figure text-sm ${
                        t.type === 'income' ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '−'}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-base text-text-ink">
              Spending by category
            </p>
            {pieData.length > 0 && (
              <span className="text-sm text-text-muted">
                Total: {formatCurrency(totalSpending)}
              </span>
            )}
          </div>
          {pieData.length === 0 ? (
            <p className="text-sm text-text-muted">
              No expense transactions this month.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderColor: '#E2E8F0',
                    fontSize: 12,
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-sm text-text-ink">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}