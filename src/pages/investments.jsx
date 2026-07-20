import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { investmentsApi } from '../api';
import { formatCurrency, formatDate, formatDateInput, titleCase } from '../utils/format';
import { Button, Card, Field, Input, Select, TextArea, Modal, Badge, Spinner, EmptyState, ErrorBanner } from '../components/ui';

const PAGE_SIZE = 15;

const emptyForm = {
  name: '',
  type: 'share',
  amount: '',
  remarks: '',
  date: formatDateInput(),
};

function toCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(rows, filename) {
  const header = ['Date', 'Type', 'Name', 'Remarks', 'Amount'];
  const lines = [
    header.join(','),
    ...rows.map((l) =>
      [
        formatDateInput(l.date),
        titleCase(l.type),
        l.name || '',
        l.remarks || '',
        l.amount,
      ]
        .map(toCsvCell)
        .join(',')
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Investments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', type: '' , startDate: '',
    endDate: ''});

  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const [count, setCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const res = await investmentsApi.list({
        limit: PAGE_SIZE,
        page,
        sort: 'date',
        order: 'desc',
        query: filters.query || undefined,
        type: filters.type || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setRows(res.data?.rows || []);
      setCount(res.data?.count || 0);
      setMetadata(res.metadata || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(loadInvestments, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

    const clearFilters = () => {
    setFilters({
     query: '', 
     type: '' , 
     startDate: '',
     endDate: ''
    });
  };
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      name: inv.name || '',
      type: inv.type,
      amount: inv.amount,
      remarks: inv.remarks || '',
      date: formatDateInput(inv.date),
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
        amount: parseFloat(form.amount),
      };
      if (editing) {
        await investmentsApi.update(editing._id, payload);
      } else {
        await investmentsApi.create(payload);
      }
      setModalOpen(false);
      loadInvestments();
    } catch (err) {
      console.log("err-------->",err)
      setError(err.message || 'Unable to save investment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment entry?')) return;
    await investmentsApi.remove(id);
    loadInvestments();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await investmentsApi.list({
        limit: Math.max(count, 1),
        page: 1,
        sort: 'date',
        order: 'desc',
        query: filters.query || undefined,
        type: filters.type || undefined,
      });
      const allRows = res.data?.rows || [];
      if (allRows.length === 0) return;
      downloadCsv(allRows, `investments-${formatDateInput()}.csv`);
    } catch (err) {
     
      alert('Unable to export investments right now.');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);
  const rangeStart = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, count);
   const hasActiveFilters = Object.values(filters).some((v) => v && v !== '');
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-ink">Investments</h1>
          <p className="text-sm text-text-muted">Track all your investments in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-line" onClick={handleExport} disabled={exporting || count === 0}>
            <Download size={16} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} /> Add investment
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 mb-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <Input
              className="pl-9"
              placeholder="Search by name…"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
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
                  <label className="mb-1 text-xs text-text-muted">Type</label>
                  <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                    <option value="">All types</option>
                    <option value="share">Share</option>
                    <option value="mutualFunds">Mutual Funds</option>
                    <option value="sip">SIP</option>
                    <option value="realEState">Real Estate</option>
                    <option value="others">Others</option>
                  </Select>
                  </div>
           <div className="flex flex-col">
              <label className="mb-1 text-xs text-text-muted">Reset</label>
              <Button
                variant="ghost"
                className="border border-line px-3 text-md"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear filters
              </Button>
            </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No investments found"
            description="Try adjusting your filters, or add a new investment entry."
            action={<Button onClick={openCreate}>Add investment</Button>}
          />
        ) : (
          <>
            <div className="divide-y divide-line">
              {rows.map((inv) => (
                <div key={inv._id} className="group flex items-center justify-between py-3">
                  <div className="flex-1">
                    <p className="text-sm text-text-ink font-medium">{inv.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {formatDate(inv.date)}
                      {inv.remarks ? ` · ${inv.remarks}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone="neutral">{titleCase(inv.type)}</Badge>
                    <span className="figure w-28 text-right text-sm text-income">
                      +{formatCurrency(inv.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openEdit(inv)} className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(inv._id)} className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
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
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit investment' : 'Add investment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="share">Share</option>
                <option value="mutualFunds">Mutual Funds</option>
                <option value="sip">SIP</option>
                <option value="realEState">Real Estate</option>
                <option value="others">Others</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <Field label="Date">
              <Input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Remarks">
            <TextArea
              rows={2}
              required
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Optional note"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add investment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}