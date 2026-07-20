import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Download, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { loansApi } from '../api';
import { formatCurrency, formatDate, formatDateInput, titleCase } from '../utils/format';
import { Button, Card, Field, Input, Select, TextArea, Modal, Badge, Spinner, EmptyState, ErrorBanner } from '../components/ui';

const PAGE_SIZE = 15;

const emptyForm = {
  personName: '',
  personContact: '',
  type: 'lent',
  amount: '',
  remarks: '',
  date: formatDateInput(),
  returnDate: '',
  interestRate: '',
};

function toCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(rows, filename) {
  const header = ['Date', 'Type', 'Person', 'Contact', 'Remarks', 'Interest Rate', 'Return Date', 'Status', 'Amount'];
  const lines = [
    header.join(','),
    ...rows.map((l) =>
      [
        formatDateInput(l.date),
        titleCase(l.type),
        l.personName || '',
        l.personContact || '',
        l.remarks || '',
        l.interestRate ?? '',
        l.returnDate ? formatDateInput(l.returnDate) : '',
        titleCase(l.status || ''),
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

export default function Loans() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', type: '', status: '' });

  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const [count, setCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await loansApi.list({
        limit: PAGE_SIZE,
        page,
        sort: 'date',
        order: 'desc',
        query: filters.query || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
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

  // Any filter change should reset back to page 1, not stay on a page that may no longer exist.
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(loadLoans, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (l) => {
    setEditing(l);
    setForm({
      personName: l.personName || '',
      personContact: l.personContact || '',
      type: l.type,
      amount: l.amount,
      remarks: l.remarks || '',
      date: formatDateInput(l.date),
      returnDate: l.returnDate ? formatDateInput(l.returnDate) : '',
      interestRate: l.interestRate ?? '',
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
        interestRate: form.interestRate === '' ? undefined : parseFloat(form.interestRate),
        returnDate: form.returnDate || undefined,
      };
      if (editing) {
        await loansApi.update(editing._id, payload);
      } else {
        await loansApi.create(payload);
      }
      setModalOpen(false);
      loadLoans();
    } catch (err) {
      setError(err.message || 'Unable to save loan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this loan entry?')) return;
    await loansApi.remove(id);
    loadLoans();
  };

  const handleToggleStatus = async (l) => {
    const status = l.status === 'paid' ? 'unpaid' : 'paid';
    try {
      await loansApi.updateStatus(l._id, {status:status});
      loadLoans();
    } catch (err) {
      console.error(err);
      alert('Unable to update status right now.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await loansApi.list({
        limit: Math.max(count, 1),
        page: 1,
        sort: 'date',
        order: 'desc',
        query: filters.query || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
      });
      const allRows = res.data?.rows || [];
      if (allRows.length === 0) return;
      downloadCsv(allRows, `loans-${formatDateInput()}.csv`);
    } catch (err) {
      console.error(err);
      alert('Unable to export loans right now.');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);
  const rangeStart = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, count);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-ink">Loans</h1>
          <p className="text-sm text-text-muted">Money you've lent out and money you've borrowed.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-line" onClick={handleExport} disabled={exporting || count === 0}>
            <Download size={16} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} /> Add loan
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <Input
              className="pl-9"
              placeholder="Search person…"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
          <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All types</option>
            <option value="lent">Lent (Given)</option>
            <option value="borrowed">Borrowed (Taken)</option>
          </Select>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
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
            title="No loans found"
            description="Try adjusting your filters, or add a new loan entry."
            action={<Button onClick={openCreate}>Add loan</Button>}
          />
        ) : (
          <>
            <div className="divide-y divide-line">
              {rows.map((l) => (
                <div key={l._id} className="group flex items-center justify-between py-3">
                  <div className="flex-1">
                    <p className="text-sm text-text-ink">
                      {l.personName}
                      {l.personContact ? <span className="text-text-muted"> · {l.personContact}</span> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {formatDate(l.date)}
                      {l.returnDate ? ` · due ${formatDate(l.returnDate)}` : ''}
                      {l.interestRate ? ` · ${l.interestRate}% interest` : ''}
                      {l.remarks ? ` · ${l.remarks}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone={l.type === 'borrowed' ? 'income' : 'expense'}>{titleCase(l.type)}</Badge>
                    <Badge tone={l.status === 'paid' ? 'income' : 'expense'}>{titleCase(l.status)}</Badge>
                    <span className={`figure w-28 text-right text-sm ${l.type === 'borrowed' ? 'text-income' : 'text-expense'}`}>
                      {l.type === 'borrowed' ? '+' : '−'}
                      {formatCurrency(l.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleToggleStatus(l)}
                        title={l.status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
                        className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink"
                      >
                        {l.status === 'paid' ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                      <button onClick={() => openEdit(l)} className="rounded-sm p-1.5 text-text-muted hover:bg-line/50 hover:text-text-ink">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(l._id)} className="rounded-sm p-1.5 text-text-muted hover:bg-expense/10 hover:text-expense">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit loan' : 'Add loan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="lent">Lent (Given)</option>
                <option value="borrowed">Borrowed (Taken)</option>
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Person name">
              <Input
                required
                value={form.personName}
                onChange={(e) => setForm({ ...form, personName: e.target.value })}
              />
            </Field>
            <Field label="Contact (optional)">
              <Input
                value={form.personContact}
                onChange={(e) => setForm({ ...form, personContact: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Remarks">
            <TextArea
              rows={2}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Optional note"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Date">
              <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Return date (optional)">
              <Input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
            </Field>
            <Field label="Interest % (optional)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.interestRate}
                onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add loan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}