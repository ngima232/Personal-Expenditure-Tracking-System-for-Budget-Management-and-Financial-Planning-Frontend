import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, PiggyBank, CheckCircle2, Eye, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { savingsGoalsApi } from '../api';
import { formatCurrency, formatDate, formatDateInput } from '../utils/format';
import { Button, Card, Field, Input, Modal, Spinner, EmptyState, ErrorBanner, Badge } from '../components/ui';

const PAGE_SIZE = 9;
const emptyForm = { title: '', description: '', targetAmount: '', targetDate: '', icon: '' };
const emptyContribution = { amount: '', note: '' ,date:''};

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const [count, setCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [contribution, setContribution] = useState(emptyContribution);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await savingsGoalsApi.list({ limit: PAGE_SIZE, page, sort: 'createdAt', order: 'desc' });
      setGoals(res.data?.rows || []);
      setCount(res.data?.count || 0);
      setMetadata(res.metadata || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [page]);

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
      description: g.description || '',
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
      if (!editing) {
        if (page === 1) loadGoals();
        else setPage(1);
      } else {
        loadGoals();
      }
    } catch (err) {
      setError(err.message || 'Unable to save goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return;
    await savingsGoalsApi.remove(id);
    if (goals.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      loadGoals();
    }
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
        date : contribution.date ? formatDateInput(contribution.date) : '',
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

  const openDetails = (g) => {
    setDetailsTarget(g);
    setDetailsOpen(true);
  };

  // Keeps the "View details" modal in sync after a contribution is added
  // or the goal list is refreshed elsewhere.
  useEffect(() => {
    if (!detailsTarget) return;
    const latest = goals.find((g) => g._id === detailsTarget._id);
    if (latest) setDetailsTarget(latest);
  }, [goals]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <>
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

                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" className="flex-1 border border-line" onClick={() => openDetails(g)}>
                    <Eye size={15} /> View details
                  </Button>
                  {!completed && (
                    <Button variant="gold" className="flex-1" onClick={() => openContribute(g)}>
                      Add contribution
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <p className="text-xs text-text-muted">
              Showing <span className="figure">{goals.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span>–
              <span className="figure">{Math.min(page * PAGE_SIZE, count)}</span> of <span className="figure">{count}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!metadata?.previousPage}
                className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs text-text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-line/40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="figure text-xs text-text-muted">
                Page {page} of {Math.max(Math.ceil(count / PAGE_SIZE), 1)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, Math.max(Math.ceil(count / PAGE_SIZE), 1)))}
                disabled={!metadata?.nextPage}
                className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs text-text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-line/40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
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

          <Field label="Description">
            <Input
              placeholder="What is this goal for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

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
          {/* <Field label="Amount">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={contribution.amount}
              onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
            />
          </Field> */}
          <div className="grid grid-cols-2 gap-4">
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
            <Field label="Date">
              <Input type="date"
                value={contribution.date}
                onChange={(e) => setContribution({ ...contribution, date: e.target.value })}
              />
            </Field>
          </div>
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

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={detailsTarget?.title || 'Goal details'}>
        {detailsTarget && (
          <div className="space-y-5">
            {detailsTarget.description && (
              <p className="text-sm text-text-muted">{detailsTarget.description}</p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-sm border border-line bg-paper px-3 py-2.5">
                <p className="text-xs text-text-muted">Saved so far</p>
                <p className="figure mt-1 text-base text-text-ink">{formatCurrency(detailsTarget.currentAmount)}</p>
              </div>
              <div className="rounded-sm border border-line bg-paper px-3 py-2.5">
                <p className="text-xs text-text-muted">Target</p>
                <p className="figure mt-1 text-base text-text-ink">{formatCurrency(detailsTarget.targetAmount)}</p>
              </div>
              <div className="rounded-sm border border-line bg-paper px-3 py-2.5">
                <p className="text-xs text-text-muted">Status</p>
                <p className="mt-1 text-base capitalize text-text-ink">{(detailsTarget.status || 'in_progress').replace('_', ' ')}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 font-display text-sm text-text-ink">
                  <Wallet size={15} /> Contribution history
                </p>
                <span className="text-xs text-text-muted">
                  {detailsTarget.contributions?.length || 0} total
                </span>
              </div>

              {!detailsTarget.contributions || detailsTarget.contributions.length === 0 ? (
                <p className="rounded-sm border border-dashed border-line py-6 text-center text-sm text-text-muted">
                  No contributions logged yet.
                </p>
              ) : (
                <div className="max-h-64 divide-y divide-line overflow-y-auto rounded-sm border border-line">
                  {[...detailsTarget.contributions]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((c, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5">
                        <div>
                          <p className="text-sm text-text-ink">{formatDate(c.date)}</p>
                          {c.note && <p className="mt-0.5 text-xs text-text-muted">{c.note}</p>}
                        </div>
                        <span className="figure text-sm text-income">+{formatCurrency(c.amount)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              {detailsTarget.status !== 'completed' && (
                <Button
                  variant="gold"
                  onClick={() => {
                    setDetailsOpen(false);
                    openContribute(detailsTarget);
                  }}
                >
                  Add contribution
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}