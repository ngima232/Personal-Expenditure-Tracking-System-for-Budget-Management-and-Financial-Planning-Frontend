import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { budgetsApi, categoriesApi } from '../api';
import { formatCurrency, formatDate, formatDateInput, titleCase } from '../utils/format';
import { Button, Card, Field, Input, Select, Modal, Spinner, EmptyState, ErrorBanner } from '../components/ui';

const emptyForm = {
  category: '',
  limitAmount: '',
  period: 'monthly',
  startDate: formatDateInput(),
  endDate: formatDateInput(new Date(new Date().setMonth(new Date().getMonth() + 1))),
  alertThreshold: 80,
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    const res = await categoriesApi.list({ limit: 100, type: 'expense', page: 1 });
    setCategories(res.data?.rows || []);
  };

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetsApi.list({ limit: 50, page: 1, sort: 'startDate', order: 'desc' });
      const rows = res.data?.rows || [];
      setBudgets(rows);

      const statusEntries = await Promise.all(
        rows.map(async (b) => {
          try {
            const statusRes = await budgetsApi.status(b._id);
            return [b._id, statusRes.data];
          } catch {
            return [b._id, null];
          }
        })
      );
      setStatuses(Object.fromEntries(statusEntries));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      category: b.category?._id || b.category,
      limitAmount: b.limitAmount,
      period: b.period,
      startDate: formatDateInput(b.startDate),
      endDate: formatDateInput(b.endDate),
      alertThreshold: b.alertThreshold,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, limitAmount: parseFloat(form.limitAmount), alertThreshold: Number(form.alertThreshold) };
      if (editing) {
        await budgetsApi.update(editing._id, payload);
      } else {
        await budgetsApi.create(payload);
      }
      setModalOpen(false);
      loadBudgets();
    } catch (err) {
      setError(err.message || 'Unable to save budget.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    await budgetsApi.remove(id);
    loadBudgets();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-ink">Budgets</h1>
          <p className="text-sm text-text-muted">Set limits per category and track spend against them.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New budget
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No budgets yet"
          description="Create a budget to start tracking spend against a limit."
          action={<Button onClick={openCreate}>New budget</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {budgets.map((b) => {
            const status = statuses[b._id];
            const percent = Math.min(status?.percentUsed ?? 0, 100);
            const isExceeded = status?.isExceeded;
            return (
              <Card key={b._id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-base text-text-ink">{b.category?.name || 'Category'}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {titleCase(b.period)} · {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="figure text-sm text-text-muted">
                    {formatCurrency(status?.spent ?? 0)} spent
                  </span>
                  <span className="figure text-sm text-text-ink">of {formatCurrency(b.limitAmount)}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className={`h-full rounded-full ${isExceeded ? 'bg-expense' : 'bg-gold'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {isExceeded && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-expense">
                    <AlertTriangle size={13} /> Over budget
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit budget' : 'New budget'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Category">
            <Select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Limit amount">
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.limitAmount}
                onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
              />
            </Field>
            <Field label="Period">
              <Select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date">
              <Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="End date">
              <Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          </div>

          <Field label="Alert threshold (%)">
            <Input
              type="number"
              min="1"
              max="100"
              value={form.alertThreshold}
              onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
