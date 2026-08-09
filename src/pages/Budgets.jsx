import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, AlertTriangle, Eye, Receipt, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { budgetsApi, categoriesApi } from '../api';
import { formatCurrency, formatDate, formatDateInput, titleCase } from '../utils/format';
import { Button, Card, Field, Input, Select, Modal, Spinner, EmptyState, ErrorBanner, TextArea } from '../components/ui';

const PAGE_SIZE = 8;
const PERIOD_OPTIONS = ['weekly', 'monthly', 'yearly'];

const emptyForm = {
  name: '',
  category: '',
  limitAmount: '',
  period: 'monthly',
  startDate: formatDateInput(),
  endDate: formatDateInput(new Date(new Date().setMonth(new Date().getMonth() + 1))),
  alertThreshold: 80,
  description: '',
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

  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    query: '',
    period: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  // Category dropdown state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsBudget, setDetailsBudget] = useState(null);

  const loadCategories = async () => {
    const res = await categoriesApi.list({ limit: 100, type: 'expense', page: 1 });
    setCategories(res.data?.rows || []);
  };

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetsApi.list({
        limit: PAGE_SIZE,
        page,
        query: filters.query || undefined,
        period: filters.period || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        sort: 'startDate',
        order: 'desc',
      });
      const rows = res.data?.rows || [];
      setBudgets(rows);
      setCount(res.data?.count || 0);
      setMetadata(res.metadata || null);

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
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Debounced load
  useEffect(() => {
    const timeout = setTimeout(loadBudgets, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      name: b.name || '',
      category: b.category?._id || b.category,
      limitAmount: b.limitAmount,
      period: b.period,
      startDate: formatDateInput(b.startDate),
      endDate: formatDateInput(b.endDate),
      alertThreshold: b.alertThreshold,
      description: b.description || '',
    });
    setError('');
    setModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      period: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setCategorySearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        limitAmount: parseFloat(form.limitAmount),
        alertThreshold: Number(form.alertThreshold),
      };
      if (editing) {
        await budgetsApi.update(editing._id, payload);
      } else {
        await budgetsApi.create(payload);
      }
      setModalOpen(false);
      if (!editing) {
        if (page === 1) loadBudgets();
        else setPage(1);
      } else {
        loadBudgets();
      }
    } catch (err) {
      setError(err.message || 'Unable to save budget.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    await budgetsApi.remove(id);
    if (budgets.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      loadBudgets();
    }
  };

  const openDetails = (b) => {
    setDetailsBudget(b);
    setDetailsOpen(true);
  };

  const filteredCategories = categories
    .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));

  const selectedCategory = categories.find((c) => c._id === filters.category);
  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);
  const rangeStart = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, count);
  const hasActiveFilters = Object.values(filters).some((v) => v && v !== '');
  const detailsStatus = detailsBudget ? statuses[detailsBudget._id] : null;

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

      {/* Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
              <Input
                className="pl-9"
                placeholder="Search by name…"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
            </div>

            {/* Custom category dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded border border-line bg-paper-card px-3 py-2 text-sm text-text-ink hover:border-brand focus:border-brand focus:outline-none"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <span>{selectedCategory?.name || 'All categories'}</span>
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute left-0 right-0 z-10 mt-1 rounded border border-line bg-paper-card shadow-lg">
                  <div className="p-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                      <Input
                        className="pl-7"
                        placeholder="Search categories…"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-text-muted">No categories found</div>
                    ) : (
                      <>
                        <button
                          className="w-full px-3 py-2 text-left text-sm hover:bg-line/50"
                          onClick={() => {
                            setFilters({ ...filters, category: '' });
                            setCategorySearch('');
                            setIsCategoryOpen(false);
                          }}
                        >
                          All categories
                        </button>
                        {filteredCategories.map((c) => (
                          <button
                            key={c._id}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-line/50"
                            onClick={() => {
                              setFilters({ ...filters, category: c._id });
                              setCategorySearch('');
                              setIsCategoryOpen(false);
                            }}
                          >
                            {c.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            >
              <option value="">All periods</option>
              {PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {titleCase(p)}
                </option>
              ))}
            </Select>

            <div className="flex items-end">
              <Button
                variant="ghost"
                className="w-full border border-line px-3 text-sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-text-muted">From</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-text-muted">To</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-text-muted">Min limit</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-text-muted">Max limit</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Budget list */}
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
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {budgets.map((b) => {
              const status = statuses[b._id];
              const percent = Math.min(status?.percentUsed ?? 0, 100);
              const isExceeded = status?.isExceeded;
              return (
                <Card key={b._id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-base text-text-ink">
                        {b.name || b.category?.name || 'Budget'}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {b.category?.name} · {titleCase(b.period)} · {formatDate(b.startDate)} – {formatDate(b.endDate)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openDetails(b)}
                        className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(b)}
                        className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="figure text-sm text-text-muted">
                      {formatCurrency(status?.spent ?? 0)} spent
                    </span>
                    <span className="figure text-sm text-text-ink">
                      of {formatCurrency(b.limitAmount)}
                    </span>
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

                  <Button
                    variant="ghost"
                    className="mt-4 w-full border border-line"
                    onClick={() => openDetails(b)}
                  >
                    <Eye size={15} /> View details
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <p className="text-xs text-text-muted">
              Showing <span className="figure">{rangeStart}</span>–<span className="figure">{rangeEnd}</span> of{' '}
              <span className="figure">{count}</span>
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit budget' : 'New budget'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Name">
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Groceries — July"
            />
          </Field>

          <Field label="Category">
            <Select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
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
              <Select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date">
              <Input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
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

          <Field label="Description">
            <TextArea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note"
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

      {/* Details Modal */}
      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={detailsBudget?.name || detailsBudget?.category?.name || 'Budget details'}>
        {detailsBudget && (
          <div className="space-y-5">
            {detailsBudget.description && <p className="text-sm text-text-muted">{detailsBudget.description}</p>}

            <div className="grid grid-cols-2 gap-3 text-xs text-text-muted">
              <div>
                <span className="block text-text-faint">Category</span>
                <span className="text-text-ink">{detailsBudget.category?.name}</span>
              </div>
              <div>
                <span className="block text-text-faint">Period</span>
                <span className="text-text-ink">
                  {titleCase(detailsBudget.period)} · {formatDate(detailsBudget.startDate)} – {formatDate(detailsBudget.endDate)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-sm border border-line bg-paper px-3 py-2.5">
                <p className="text-xs text-text-muted">Spent</p>
                <p className={`figure mt-1 text-base ${detailsStatus?.isExceeded ? 'text-expense' : 'text-text-ink'}`}>
                  {formatCurrency(detailsStatus?.spent ?? 0)}
                </p>
              </div>
              <div className="rounded-sm border border-line bg-paper px-3 py-2.5">
                <p className="text-xs text-text-muted">Remaining</p>
                <p className="figure mt-1 text-base text-text-ink">
                  {formatCurrency(detailsStatus?.remaining ?? 0)}
                </p>
              </div>
              <div className="rounded-sm border border-line bg-paper px-3 py-2.5">
                <p className="text-xs text-text-muted">Limit</p>
                <p className="figure mt-1 text-base text-text-ink">
                  {formatCurrency(detailsBudget.limitAmount)}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 font-display text-sm text-text-ink">
                  <Receipt size={15} /> Spending breakdown
                </p>
                <span className="text-xs text-text-muted">
                  {detailsStatus?.transactionCount ?? 0} transactions
                </span>
              </div>

              {!detailsStatus?.transactions || detailsStatus.transactions.length === 0 ? (
                <p className="rounded-sm border border-dashed border-line py-6 text-center text-sm text-text-muted">
                  No expenses logged against this budget yet.
                </p>
              ) : (
                <div className="max-h-64 divide-y divide-line overflow-y-auto rounded-sm border border-line">
                  {detailsStatus.transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between px-3 py-2.5">
                      <div>
                        <p className="text-sm text-text-ink">{t.description || 'Expense'}</p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {formatDate(t.date)} · {titleCase(t.paymentMethod || '')}
                        </p>
                      </div>
                      <span className="figure text-sm text-expense">−{formatCurrency(t.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  openEdit(detailsBudget);
                }}
              >
                Edit budget
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}