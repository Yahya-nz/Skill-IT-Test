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
import './PaymentsPage.css';

const now = new Date();

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ month: '', year: now.getFullYear(), status: '' });
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [houses, setHouses] = useState([]);
  const [residents, setResidents] = useState([]);

  const [form, setForm] = useState({
    house_id: '', resident_id: '', year: now.getFullYear(), month: now.getMonth() + 1,
    payment_type: 'both', months_paid: 1, paid_at: now.toISOString().slice(0, 10),
    status: 'lunas', notes: ''
  });

  const load = async () => {
    setFetching(true);
    const [p, h, r] = await Promise.all([
      api.get('/payments', { params: { page, ...filters } }),
      api.get('/houses', { params: { per_page: 100, status: 'dihuni' } }),
      api.get('/residents', { params: { per_page: 100 } }),
    ]);
    setPayments(p.data.data);
    setMeta(p.data.meta);
    setHouses(h.data.data);
    setResidents(r.data.data);
    setFetching(false);
  };

  useEffect(() => { load(); }, [page, filters]);

  const openCreate = () => {
    setForm({
      house_id: '', resident_id: '', year: now.getFullYear(), month: now.getMonth() + 1,
      payment_type: 'both', months_paid: 1, paid_at: now.toISOString().slice(0, 10),
      status: 'lunas', notes: ''
    });
    setModal(true);
  };

  const calcAmount = () => {
    const rates = { kebersihan: 15000, satpam: 100000 };
    const base = form.payment_type === 'both' ? 115000 : form.payment_type === 'kebersihan' ? 15000 : 100000;
    return formatCurrency(base * (form.months_paid || 1));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments', form);
      setModal(false); load();
    } finally { setLoading(false); }
  };

  const handleStatusToggle = async p => {
    await api.put(`/payments/${p.id}`, {
      status: p.status === 'lunas' ? 'belum' : 'lunas',
      paid_at: p.status === 'lunas' ? null : new Date().toISOString().slice(0, 10),
    });
    load();
  };

  const handleDelete = async id => {
    if (!confirm('Hapus data pembayaran ini?')) return;
    await api.delete(`/payments/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader title="Pembayaran" subtitle="Kelola iuran bulanan penghuni" action={<Button onClick={openCreate}>Tambah Pembayaran</Button>} />

      <div className="filter-bar">
        <select className="filter-select" value={filters.month} onChange={e => { setFilters(f => ({ ...f, month: e.target.value })); setPage(1); }}>
          <option value="">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="filter-select" value={filters.year} onChange={e => { setFilters(f => ({ ...f, year: e.target.value })); setPage(1); }}>
          {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
        <select className="filter-select" value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="belum">Belum Lunas</option>
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Rumah</Th>
            <Th>Penghuni</Th>
            <Th>Periode</Th>
            <Th>Jenis</Th>
            <Th>Nominal</Th>
            <Th>Tanggal Bayar</Th>
            <Th>Status</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {fetching ? <tr><Td colSpan={8}><div className="empty-state">Memuat...</div></Td></tr>
           : payments.length === 0 ? <tr><Td colSpan={8}><div className="empty-state">Belum ada data pembayaran</div></Td></tr>
           : payments.map(p => (
            <tr key={p.id}>
              <Td><span className="house-tag">{p.house?.house_number}</span></Td>
              <Td>{p.resident?.full_name}</Td>
              <Td>{MONTHS[(p.month || 1) - 1]} {p.year}{p.months_paid > 1 ? ` (${p.months_paid} bln)` : ''}</Td>
              <Td>{p.payment_type === 'both' ? 'Kebersihan + Satpam' : p.payment_type}</Td>
              <Td><span className="amount">{formatCurrency(p.amount)}</span></Td>
              <Td>{formatDate(p.paid_at)}</Td>
              <Td>
                <button className={`status-toggle ${p.status}`} onClick={() => handleStatusToggle(p)}>
                  {p.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                </button>
              </Td>
              <Td><Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Hapus</Button></Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination meta={meta} onPage={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Pembayaran" size="md">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Rumah" required>
              <select value={form.house_id} onChange={e => setForm(f => ({ ...f, house_id: e.target.value }))} required>
                <option value="">-- Pilih --</option>
                {houses.map(h => <option key={h.id} value={h.id}>{h.house_number}</option>)}
              </select>
            </FormField>
            <FormField label="Penghuni" required>
              <select value={form.resident_id} onChange={e => setForm(f => ({ ...f, resident_id: e.target.value }))} required>
                <option value="">-- Pilih --</option>
                {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Bulan" required>
              <select value={form.month} onChange={e => setForm(f => ({ ...f, month: +e.target.value }))} required>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Tahun" required>
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} required />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Jenis Iuran" required>
              <select value={form.payment_type} onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))}>
                <option value="both">Kebersihan + Satpam</option>
                <option value="kebersihan">Kebersihan Saja</option>
                <option value="satpam">Satpam Saja</option>
              </select>
            </FormField>
            <FormField label="Jumlah Bulan" required>
              <input type="number" min={1} max={12} value={form.months_paid} onChange={e => setForm(f => ({ ...f, months_paid: +e.target.value }))} />
            </FormField>
          </div>
          <div className="payment-preview">
            Total: <strong>{calcAmount()}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Tanggal Bayar" required>
              <input type="date" value={form.paid_at} onChange={e => setForm(f => ({ ...f, paid_at: e.target.value }))} />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="lunas">Lunas</option>
                <option value="belum">Belum Lunas</option>
              </select>
            </FormField>
          </div>
          <FormField label="Catatan">
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
