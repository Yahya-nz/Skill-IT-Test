import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { Table, Th, Td } from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate, MONTHS } from '../../utils/format';
import './ExpensesPage.css';

const now = new Date();
const CATEGORIES = {
  perbaikan_jalan: 'Perbaikan Jalan',
  perbaikan_selokan: 'Perbaikan Selokan',
  gaji_satpam: 'Gaji Satpam',
  listrik_pos: 'Listrik Pos',
  lainnya: 'Lainnya',
};

const emptyForm = { title: '', description: '', amount: '', expense_date: now.toISOString().slice(0, 10), category: 'lainnya' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ month: '', year: '' });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = async () => {
    setFetching(true);
    const res = await api.get('/expenses', { params: { page, ...filters } });
    setExpenses(res.data.data);
    setMeta(res.data.meta);
    setFetching(false);
  };

  useEffect(() => { load(); }, [page, filters]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = e => { setEditing(e); setForm({ title: e.title, description: e.description || '', amount: e.amount, expense_date: e.expense_date, category: e.category }); setModal(true); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await api.put(`/expenses/${editing.id}`, form);
      else await api.post('/expenses', form);
      setModal(false); load();
    } finally { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Hapus data pengeluaran ini?')) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader title="Pengeluaran" subtitle="Kelola pengeluaran operasional RT" action={<Button onClick={openCreate}>Tambah Pengeluaran</Button>} />

      <div className="filter-bar">
        <select className="filter-select" value={filters.month} onChange={e => { setFilters(f => ({ ...f, month: e.target.value })); setPage(1); }}>
          <option value="">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="filter-select" value={filters.year} onChange={e => { setFilters(f => ({ ...f, year: e.target.value })); setPage(1); }}>
          <option value="">Semua Tahun</option>
          {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Judul</Th>
            <Th>Kategori</Th>
            <Th>Tanggal</Th>
            <Th>Nominal</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {fetching ? <tr><Td colSpan={5}><div className="empty-state">Memuat...</div></Td></tr>
           : expenses.length === 0 ? <tr><Td colSpan={5}><div className="empty-state">Belum ada pengeluaran</div></Td></tr>
           : expenses.map(e => (
            <tr key={e.id}>
              <Td>
                <div className="expense-title">{e.title}</div>
                {e.description && <div className="expense-desc">{e.description}</div>}
              </Td>
              <Td><Badge variant="default">{CATEGORIES[e.category]}</Badge></Td>
              <Td>{formatDate(e.expense_date)}</Td>
              <Td><span className="amount">{formatCurrency(e.amount)}</span></Td>
              <Td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(e)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(e.id)}>Hapus</Button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination meta={meta} onPage={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Judul" required><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Kategori" required>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Tanggal" required><input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} required /></FormField>
          </div>
          <FormField label="Nominal (Rp)" required><input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></FormField>
          <FormField label="Keterangan"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
