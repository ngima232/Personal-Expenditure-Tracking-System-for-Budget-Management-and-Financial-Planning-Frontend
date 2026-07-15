import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { transactionsApi, categoriesApi } from '../api';
import { formatCurrency, formatDate, formatDateInput, titleCase } from '../utils/format';
import { Button, Card, Field, Input, Select, TextArea, Modal, Badge, Spinner, EmptyState, ErrorBanner } from '../components/ui';

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'mobile_wallet', 'other'];

const emptyForm = {
  type: 'expense',
  category: '',
  amount: '',
  description: '',
  paymentMethod: 'card',
  date: formatDateInput(),
};

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', type: '', category: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    const res = await categoriesApi.list({ limit: 100, page: 1 });
    setCategories(res.data?.rows || []);
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.list({
        limit: 50,
        page: 1,
        sort: 'date',
        order: 'desc',
        query: filters.query || undefined,
        type: filters.type || undefined,
        category: filters.category || undefined,
      });
      setRows(res.data?.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadTransactions, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      type: t.type,
      category: t.category?._id || t.category,
      amount: t.amount,
      description: t.description || '',
      paymentMethod: t.paymentMethod || 'other',
      date: formatDateInput(t.date),
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) {
        await transactionsApi.update(editing._id, payload);
      } else {
        await transactionsApi.create(payload);
      }
      setModalOpen(false);
      loadTransactions();
    } catch (err) {
      setError(err.message || 'Unable to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await transactionsApi.remove(id);
    loadTransactions();
  };

  const filteredCategories = categories.filter((c) => !form.type || c.type === form.type);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-ink">Transactions</h1>
          <p className="text-sm text-text-muted">Every income and expense, in one ledger.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add transaction
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <Input
              className="pl-9"
              placeholder="Search description…"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
          <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try adjusting your filters, or add a new transaction."
            action={<Button onClick={openCreate}>Add transaction</Button>}
          />
        ) : (
          <div className="divide-y divide-line">
            {rows.map((t) => (
              <div key={t._id} className="group flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-text-ink">{t.description || t.category?.name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {formatDate(t.date)} · {t.category?.name} · {titleCase(t.paymentMethod || '')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge tone={t.type === 'income' ? 'income' : 'expense'}>{titleCase(t.type)}</Badge>
                  <span className={`figure w-28 text-right text-sm ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(t)} className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit transaction' : 'Add transaction'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category: '' })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Select>
            </Field>
            <Field label="Amount">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Category">
            <Select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Description">
            <TextArea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment method">
              <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {titleCase(m)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
