import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [summaryRes, txRes, budgetRes] = await Promise.all([
          transactionsApi.summary({ startDate: startOfMonth() }),
          transactionsApi.list({ limit: 6, sort: 'date', order: 'desc', page: 1 }),
          budgetsApi.list({ limit: 4, isActive: true, page: 1 }),
        ]);
        if (!mounted) return;
        setSummary(summaryRes.data);
        setRecent(txRes.data?.rows || []);
        setBudgets(budgetRes.data?.rows || []);
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

  const chartData = recent
    .slice()
    .reverse()
    .map((t) => ({
      date: formatDate(t.date),
      amount: t.type === 'expense' ? -t.amount : t.amount,
    }));

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">This month</p>
        <div className="mt-2 flex items-baseline gap-3">
          <h1 className="figure font-display text-5xl font-medium text-text-ink">
            {formatCurrency(net)}
          </h1>
          <span className={`flex items-center text-sm font-medium ${net >= 0 ? 'text-income' : 'text-expense'}`}>
            {net >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            Net balance
          </span>
        </div>
        <div className="ledger-rule mt-6" />
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Income</p>
            <p className="figure mt-1 text-2xl text-income">{formatCurrency(income)}</p>
          </div>
          <TrendingUp className="text-income" size={28} strokeWidth={1.5} />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Expenses</p>
            <p className="figure mt-1 text-2xl text-expense">{formatCurrency(expense)}</p>
          </div>
          <TrendingDown className="text-expense" size={28} strokeWidth={1.5} />
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 font-display text-base text-text-ink">Recent activity</p>
          {chartData.length === 0 ? (
            <EmptyState title="No transactions yet" description="Add your first income or expense to see trends here." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F5C52" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1F5C52" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#D8DBD3" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5B685F' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5B685F' }} axisLine={false} tickLine={false} width={70}
                  tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ borderColor: '#D8DBD3', fontSize: 12, fontFamily: 'Inter' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1F5C52" strokeWidth={2} fill="url(#netGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <p className="mb-4 font-display text-base text-text-ink">Active budgets</p>
          {budgets.length === 0 ? (
            <p className="text-sm text-text-muted">No active budgets set.</p>
          ) : (
            <ul className="space-y-4">
              {budgets.map((b) => (
                <li key={b._id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-text-ink">{b.category?.name || 'Category'}</span>
                    <span className="figure text-text-muted">{formatCurrency(b.limitAmount)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                    <div className="h-full rounded-full bg-gold" style={{ width: '45%' }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <p className="mb-4 font-display text-base text-text-ink">Latest transactions</p>
        {recent.length === 0 ? (
          <EmptyState title="Nothing logged yet" description="Transactions you add will show up here." />
        ) : (
          <div className="divide-y divide-line">
            {recent.map((t) => (
              <div key={t._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-text-ink">{t.description || t.category?.name || 'Transaction'}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {formatDate(t.date)} · {t.category?.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={t.type === 'income' ? 'income' : 'expense'}>{titleCase(t.type)}</Badge>
                  <span className={`figure text-sm ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
