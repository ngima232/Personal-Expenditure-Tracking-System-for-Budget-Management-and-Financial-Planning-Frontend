import { useEffect, useState } from 'react';
import { Plus, Pencil,Search, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoriesApi } from '../api';
import {  titleCase } from '../utils/format';
import { Button, Card, Field, Input, Select, Modal, Spinner, EmptyState, ErrorBanner, Badge } from '../components/ui';

const PAGE_SIZE = 12;
const emptyForm = { name: '', type: 'expense', icon: '', color: '#1F5C52' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('expense');

  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const [count, setCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list({ limit: PAGE_SIZE, page, type: tab });
      setCategories(res.data?.rows || []);
      setCount(res.data?.count || 0);
      setMetadata(res.metadata || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  // Switching tabs should always land back on page 1, since the previous
  // page number likely doesn't exist for the other type's result set.
  const changeTab = (t) => {
    setTab(t);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, type: tab });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, icon: c.icon || '', color: c.color || '#1F5C52' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await categoriesApi.update(editing._id, form);
      } else {
        await categoriesApi.create(form);
      }
      setModalOpen(false);
      if (!editing) {
        if (page === 1) load();
        else setPage(1);
      } else {
        load();
      }
    } catch (err) {
      setError(err.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await categoriesApi.remove(id);
    if (categories.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      load();
    }
  };

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-ink">Categories</h1>
          <p className="text-sm text-text-muted">Organize how income and expenses get labeled.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New category
        </Button>
      </div>

      <div className="mb-5 flex gap-2 border-b border-line">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            onClick={() => changeTab(t)}
            className={`-mb-px border-b-2 px-1 pb-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-brand text-text-ink' : 'border-transparent text-text-muted hover:text-text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title={`No ${tab} categories yet`}
          description="Create one to start tagging transactions."
          action={<Button onClick={openCreate}>New category</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Card key={c._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${c.color || '#1F5C52'}20`, color: c.color || '#1F5C52' }}
                  >
                    <Tag size={16} />
                  </span>
                  <div>
                    <p className="text-sm text-text-ink">{c.name}</p>
                    {c.isDefault && <Badge tone="neutral">Default</Badge>}
                  </div>
                </div>
                {!c.isDefault && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <p className="text-xs text-text-muted">
              Showing <span className="figure">{categories.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span>–
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
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={!metadata?.nextPage}
                className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs text-text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-line/40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Groceries" />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </Field>
          <Field label="Color">
            <input
              type="color"
              className="h-10 w-full rounded-sm border border-line bg-paper-card"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}