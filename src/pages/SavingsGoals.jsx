import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, PiggyBank, CheckCircle2 } from 'lucide-react';
import { savingsGoalsApi } from '../api';
import { formatCurrency, formatDate, formatDateInput } from '../utils/format';
import { Button, Card, Field, Input, Modal, Spinner, EmptyState, ErrorBanner, Badge } from '../components/ui';

const emptyForm = { title: '', targetAmount: '', targetDate: '', icon: '' };
const emptyContribution = { amount: '', note: '' };

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [contribution, setContribution] = useState(emptyContribution);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await savingsGoalsApi.list({ limit: 50, page: 1, sort: 'createdAt', order: 'desc' });
      setGoals(res.data?.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    setForm({
      title: g.title,
      targetAmount: g.targetAmount,
      targetDate: g.targetDate ? formatDateInput(g.targetDate) : '',
      icon: g.icon || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.targetDate || undefined,
      };
      if (editing) {
        await savingsGoalsApi.update(editing._id, payload);
      } else {
        await savingsGoalsApi.create(payload);
      }
      setModalOpen(false);
      loadGoals();
    } catch (err) {
      setError(err.message || 'Unable to save goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return;
    await savingsGoalsApi.remove(id);
    loadGoals();
  };

  const openContribute = (g) => {
    setContributeTarget(g);
    setContribution(emptyContribution);
    setError('');
    setContributeOpen(true);
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await savingsGoalsApi.contribute(contributeTarget._id, {
        amount: parseFloat(contribution.amount),
        note: contribution.note || undefined,
      });
      setContributeOpen(false);
      loadGoals();
    } catch (err) {
      setError(err.message || 'Unable to add contribution.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-ink">Savings Goals</h1>
          <p className="text-sm text-text-muted">Set targets and watch your progress grow.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="No savings goals yet"
          description="Create a goal — a trip, an emergency fund, anything — and start contributing toward it."
          action={<Button onClick={openCreate}>New goal</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => {
            const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100) || 0, 100);
            const completed = g.status === 'completed';
            return (
              <Card key={g._id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank size={18} className="text-gold" />
                    <p className="font-display text-base text-text-ink">{g.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(g)} className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(g._id)} className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {completed && (
                  <Badge tone="income">
                    <CheckCircle2 size={12} className="mr-1 inline" /> Completed
                  </Badge>
                )}

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="figure text-lg text-text-ink">{formatCurrency(g.currentAmount)}</span>
                  <span className="figure text-sm text-text-muted">of {formatCurrency(g.targetAmount)}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>{percent}% funded</span>
                  {g.targetDate && <span>Target {formatDate(g.targetDate)}</span>}
                </div>

                {!completed && (
                  <Button variant="gold" className="mt-4 w-full" onClick={() => openContribute(g)}>
                    Add contribution
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit goal' : 'New savings goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Emergency fund"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Target amount">
              <Input
                type="number"
                step="0.01"
                min="1"
                required
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              />
            </Field>
            <Field label="Target date (optional)">
              <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create goal'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={contributeOpen} onClose={() => setContributeOpen(false)} title={`Contribute to ${contributeTarget?.title || ''}`}>
        <form onSubmit={handleContribute} className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Amount">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={contribution.amount}
              onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
            />
          </Field>
          <Field label="Note (optional)">
            <Input
              value={contribution.note}
              onChange={(e) => setContribution({ ...contribution, note: e.target.value })}
              placeholder="e.g. Birthday money"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setContributeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={saving}>
              {saving ? 'Adding…' : 'Add contribution'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
